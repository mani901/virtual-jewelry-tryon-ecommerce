import productModel from "../models/productModel.js"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter(Boolean)

        // Use BACKEND_URL env var so the stored URL is always correct regardless
        // of how Express detects the protocol/host (proxy, Docker, etc.).
        const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`
        const imagesUrl = images.map(f => `${baseUrl}/uploads/${f.filename}`)

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: sizes ? JSON.parse(sizes) : [],
            image: imagesUrl,
            date: Date.now()
        }

        const product = new productModel(productData)
        await product.save()
        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({})
        res.json({ success: true, products })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const removeProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id)

        if (product) {
            // Delete the locally stored image files so disk doesn't accumulate
            // orphaned uploads every time a product is removed.
            for (const imgUrl of product.image || []) {
                const filename = imgUrl.split('/uploads/').pop()
                if (filename) {
                    const filePath = path.join(UPLOADS_DIR, filename)
                    try {
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
                    } catch {
                        // Ignore — file may already be gone
                    }
                }
            }
        }

        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct }
