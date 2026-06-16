import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// POST /api/review/add  — authUser
const addReview = async (req, res) => {
    try {
        const { userId, productId, rating, text } = req.body;

        if (!productId || !rating || !text?.trim()) {
            return res.json({ success: false, message: "Product, rating, and review text are required" });
        }
        const parsedRating = Number(rating);
        if (parsedRating < 1 || parsedRating > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: "Product not found" });

        const alreadyReviewed = product.reviews.some(r => r.userId === userId);
        if (alreadyReviewed) {
            return res.json({ success: false, message: "You have already reviewed this product" });
        }

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        product.reviews.push({
            userId,
            name: user.name,
            rating: parsedRating,
            text: text.trim(),
            date: Date.now(),
        });

        await product.save();
        res.json({ success: true, message: "Review added", reviews: product.reviews });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// POST /api/review/delete  — authUser (own review only)
const deleteReview = async (req, res) => {
    try {
        const { userId, productId, reviewId } = req.body;

        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: "Product not found" });

        const idx = product.reviews.findIndex(
            r => r._id.toString() === reviewId && r.userId === userId
        );
        if (idx === -1) {
            return res.json({ success: false, message: "Review not found or not authorized" });
        }

        product.reviews.splice(idx, 1);
        await product.save();
        res.json({ success: true, message: "Review deleted", reviews: product.reviews });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// POST /api/review/admin-delete  — adminAuth
const adminDeleteReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.body;

        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: "Product not found" });

        const idx = product.reviews.findIndex(r => r._id.toString() === reviewId);
        if (idx === -1) return res.json({ success: false, message: "Review not found" });

        product.reviews.splice(idx, 1);
        await product.save();
        res.json({ success: true, message: "Review deleted" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/review/all  — adminAuth  (all products with their reviews)
const getAllReviews = async (req, res) => {
    try {
        const products = await productModel.find({ "reviews.0": { $exists: true } }, {
            name: 1, image: 1, reviews: 1
        });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addReview, deleteReview, adminDeleteReview, getAllReviews };
