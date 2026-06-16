import userModel from "../models/userModel.js";

const addToWishlist = async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const userData = await userModel.findById(userId);
        let wishlistData = userData.wishlistData || {};
        wishlistData[itemId] = true;
        await userModel.findByIdAndUpdate(userId, { wishlistData });
        res.json({ success: true, message: "Added to wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const removeFromWishlist = async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        const userData = await userModel.findById(userId);
        let wishlistData = userData.wishlistData || {};
        delete wishlistData[itemId];
        await userModel.findByIdAndUpdate(userId, { wishlistData });
        res.json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId);
        res.json({ success: true, wishlistData: userData.wishlistData || {} });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addToWishlist, removeFromWishlist, getWishlist };
