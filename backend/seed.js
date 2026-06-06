import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true },
    image:       { type: Array,  required: true },
    category:    { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes:       { type: Array,  required: false, default: [] },
    bestseller:  { type: Boolean },
    date:        { type: Number, required: true },
})

const Product = mongoose.models.product || mongoose.model('product', productSchema)

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000'
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const JEWELRY_ASSETS = path.join(__dirname, '..', 'ai-model', 'app', 'assets', 'jewelry_assets')

// AI model subfolder → store category name
const CATEGORY_MAP = [
    { subfolder: 'earrings',   category: 'Earrings'   },
    { subfolder: 'glasses',    category: 'Glasses'    },
    { subfolder: 'headpieces', category: 'Headpieces' },
    { subfolder: 'nose_rings', category: 'Nose Rings' },
]

// One product definition per image, in order; subCategory assigned by index position
const PRODUCT_TEMPLATES = {
    Earrings: [
        { name: '22K Gold Jhumka Drop Earrings',      description: 'Traditional 22K gold jhumka drop earrings with intricate granulation work and a melodic bell drop, perfect for festive and bridal occasions.',              price: 22000, subCategory: 'Gold',     bestseller: true  },
        { name: 'Sterling Silver Hoop Earrings',       description: 'Sleek sterling silver hoop earrings with a polished finish, lightweight and comfortable for everyday elegance.',                                          price:  4500, subCategory: 'Silver',   bestseller: false },
        { name: 'Diamond Halo Stud Earrings',          description: 'Brilliant-cut diamond halo stud earrings in platinum settings, where a central diamond is encircled by a dazzling ring of pavé stones.',                price: 95000, subCategory: 'Diamond',  bestseller: true  },
        { name: 'Freshwater Pearl Drop Earrings',      description: 'Elegant freshwater pearl drop earrings on a delicate gold chain, offering luminous classic beauty for bridal and formal occasions.',                     price: 12000, subCategory: 'Pearl',    bestseller: false },
        { name: 'Amethyst Gemstone Drop Earrings',     description: 'Delicate amethyst drop earrings featuring faceted purple gemstones in a silver bezel setting, bringing a touch of royalty to any outfit.',              price: 24000, subCategory: 'Gemstone', bestseller: true  },
    ],
    Glasses: [
        { name: '22K Gold Frame Cat Eye Glasses',      description: 'Luxurious cat-eye fashion glasses with a 22K gold-plated frame, combining timeless femininity with opulent Pakistani craftsmanship.',                   price: 18000, subCategory: 'Gold',     bestseller: true  },
        { name: 'Sterling Silver Round Frame Glasses', description: 'Minimalist round glasses with a sterling silver frame, channelling vintage intellectual charm with a modern Pakistani twist.',                           price:  9500, subCategory: 'Silver',   bestseller: false },
        { name: 'Diamond-Studded Cat Eye Glasses',     description: 'Show-stopping cat-eye glasses with pavé-set diamond accents on the temples, crafted for bridal and gala events.',                                       price: 85000, subCategory: 'Diamond',  bestseller: true  },
        { name: 'Pearl Embellished Oval Glasses',      description: 'Whimsical oval frames adorned with freshwater pearl accents along the temples, bringing a romantic and feminine energy to any look.',                   price: 22000, subCategory: 'Pearl',    bestseller: false },
        { name: 'Emerald Gemstone Cat Eye Glasses',    description: 'Bold cat-eye frames with channel-set emerald gemstones along the top bar, a statement piece for the fashion-forward Pakistani woman.',                  price: 42000, subCategory: 'Gemstone', bestseller: true  },
    ],
    Headpieces: [
        { name: '22K Gold Maang Tikka with Pearl Drop', description: 'A stunning 22K gold maang tikka adorned with freshwater pearls and a teardrop pendant, the centrepiece of any Pakistani bridal look.',                price: 55000, subCategory: 'Gold',   bestseller: true  },
        { name: 'Sterling Silver Maang Tikka',          description: 'A delicate sterling silver maang tikka with a crescent motif and drop chain, perfect for formal events and light bridal wear.',                       price:  8500, subCategory: 'Silver', bestseller: false },
    ],
    'Nose Rings': [
        { name: '22K Gold Nath with Pearl Drop',       description: 'An heirloom-quality 22K gold nath (bridal nose ring) featuring a lustrous freshwater pearl drop and delicate chain, essential for Pakistani brides.',  price: 28000, subCategory: 'Gold',   bestseller: true  },
    ],
}

function copyJewelryImages() {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    }

    const urls = {}

    for (const { subfolder, category } of CATEGORY_MAP) {
        const srcDir = path.join(JEWELRY_ASSETS, subfolder)

        if (!fs.existsSync(srcDir)) {
            console.warn(`  ⚠  Not found: ${srcDir}`)
            urls[category] = []
            continue
        }

        const files = fs.readdirSync(srcDir)
            .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
            .sort()

        urls[category] = files.map((file, i) => {
            const ext  = path.extname(file).toLowerCase()
            const dest = `${subfolder}-${i + 1}${ext}`
            fs.copyFileSync(path.join(srcDir, file), path.join(UPLOADS_DIR, dest))
            return `${BACKEND_URL}/uploads/${dest}`
        })

        console.log(`  ✓  ${category}: copied ${files.length} image(s)`)
    }

    return urls
}

async function seed() {
    await mongoose.connect(`${process.env.MONGODB_URI}/zewar-house`)
    console.log('Connected to MongoDB — zewar-house')

    console.log('\nCopying jewelry images from AI model assets...')
    const imageUrls = copyJewelryImages()

    await Product.deleteMany({})
    console.log('\nCleared existing products.')

    const products = []

    for (const [category, templates] of Object.entries(PRODUCT_TEMPLATES)) {
        const urls = imageUrls[category] ?? []

        templates.forEach((tpl, i) => {
            const imageUrl = urls[i]
            if (!imageUrl) {
                console.warn(`  ⚠  No image available for "${tpl.name}" — skipped`)
                return
            }
            products.push({
                ...tpl,
                category,
                image: [imageUrl],
                sizes: [],
                date: Date.now(),
            })
        })
    }

    const result = await Product.insertMany(products)
    console.log(`\nInserted ${result.length} products successfully:`)
    result.forEach(p => console.log(`  • [${p.category}] ${p.name}`))

    await mongoose.disconnect()
    console.log('\nDone.')
}

seed().catch((err) => { console.error(err); process.exit(1) })
