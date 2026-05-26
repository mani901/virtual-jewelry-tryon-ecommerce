import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

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
});

const Product = mongoose.models.product || mongoose.model('product', productSchema);

// loremflickr.com serves keyword-matched Flickr photos; lock= keeps the image stable
const lf = (keywords, lock) =>
    [`https://loremflickr.com/500/600/${keywords}?lock=${lock}`];

const products = [
    // ── Necklaces · Gold ─────────────────────────────────────────────
    {
        name: '22K Gold Layered Chain Necklace',
        description: 'A stunning 22-karat gold layered chain necklace featuring a delicate multi-strand design, perfect for both everyday elegance and special occasions.',
        price: 45000, category: 'Necklaces', subCategory: 'Gold', bestseller: true,
        image: lf('gold,necklace,chain,jewelry', 1),
    },
    {
        name: 'Gold Kundan Pendant Necklace',
        description: 'Handcrafted Kundan pendant necklace set in 22K gold with vibrant enamel work, honouring centuries of traditional Pakistani jewellery artistry.',
        price: 38000, category: 'Necklaces', subCategory: 'Gold', bestseller: false,
        image: lf('gold,pendant,necklace,jewelry', 2),
    },

    // ── Necklaces · Silver ───────────────────────────────────────────
    {
        name: 'Sterling Silver Choker with Charm',
        description: 'A contemporary sterling silver choker adorned with a minimalist charm pendant, offering understated elegance for the modern woman.',
        price: 8500, category: 'Necklaces', subCategory: 'Silver', bestseller: true,
        image: lf('silver,choker,necklace,jewelry', 3),
    },
    {
        name: 'Silver Filigree Long Chain',
        description: 'Intricately crafted silver filigree long chain necklace with delicate lattice work, a timeless piece for layering or wearing solo.',
        price: 6200, category: 'Necklaces', subCategory: 'Silver', bestseller: false,
        image: lf('silver,chain,necklace,jewelry', 4),
    },

    // ── Necklaces · Diamond ──────────────────────────────────────────
    {
        name: 'Diamond Solitaire Pendant Necklace',
        description: 'A breathtaking diamond solitaire pendant in a four-prong gold setting, symbolising purity and enduring love.',
        price: 125000, category: 'Necklaces', subCategory: 'Diamond', bestseller: true,
        image: lf('diamond,pendant,necklace,jewelry', 5),
    },
    {
        name: 'Diamond Station Tennis Necklace',
        description: 'An exquisite diamond station necklace featuring evenly spaced brilliant-cut diamonds set in white gold, radiating effortless luxury.',
        price: 185000, category: 'Necklaces', subCategory: 'Diamond', bestseller: false,
        image: lf('diamond,necklace,white,gold,jewelry', 6),
    },

    // ── Necklaces · Pearl ────────────────────────────────────────────
    {
        name: 'South Sea Pearl Strand Necklace',
        description: 'A classic single-strand South Sea pearl necklace with a sterling silver clasp, each pearl selected for its exceptional lustre and roundness.',
        price: 32000, category: 'Necklaces', subCategory: 'Pearl', bestseller: false,
        image: lf('pearl,necklace,strand,jewelry', 7),
    },
    {
        name: 'Freshwater Pearl Layered Necklace',
        description: 'A beautifully layered freshwater pearl necklace blending baroque and round pearls on gold-filled chains for a bohemian luxury look.',
        price: 18500, category: 'Necklaces', subCategory: 'Pearl', bestseller: true,
        image: lf('pearl,layered,necklace,jewelry', 8),
    },

    // ── Necklaces · Gemstone ─────────────────────────────────────────
    {
        name: 'Emerald and Gold Collar Necklace',
        description: 'A bold collar necklace featuring hand-selected emerald gemstones bezel-set in 18K gold, inspired by Mughal jewellery traditions.',
        price: 55000, category: 'Necklaces', subCategory: 'Gemstone', bestseller: true,
        image: lf('emerald,gemstone,necklace,jewelry', 9),
    },
    {
        name: 'Ruby Drop Gemstone Necklace',
        description: 'Elegant ruby drop necklace with faceted rubies suspended from a delicate gold chain, adding a vibrant splash of colour to any ensemble.',
        price: 42000, category: 'Necklaces', subCategory: 'Gemstone', bestseller: false,
        image: lf('ruby,gemstone,necklace,jewelry', 10),
    },

    // ── Earrings · Gold ──────────────────────────────────────────────
    {
        name: 'Gold Jhumka Chandelier Earrings',
        description: 'Traditional 22K gold jhumka chandelier earrings with intricate granulation work and a melodic bell drop, perfect for festive occasions.',
        price: 22000, category: 'Earrings', subCategory: 'Gold', bestseller: true,
        image: lf('gold,drop,earring,jewelry', 11),
    },
    {
        name: '22K Gold Stud Earrings with Enamel',
        description: 'Refined 22K gold stud earrings featuring hand-painted enamel motifs in rich jewel tones, blending artistry with everyday wearability.',
        price: 15000, category: 'Earrings', subCategory: 'Gold', bestseller: false,
        image: lf('gold,stud,earring,jewelry', 12),
    },

    // ── Earrings · Silver ────────────────────────────────────────────
    {
        name: 'Silver Hoop Earrings with Turquoise',
        description: 'Sleek sterling silver hoop earrings accented with natural turquoise stones, combining boho charm with artisan craftsmanship.',
        price: 4500, category: 'Earrings', subCategory: 'Silver', bestseller: false,
        image: lf('silver,hoop,earring,jewelry', 13),
    },
    {
        name: 'Sterling Silver Drop Earrings',
        description: 'Graceful sterling silver drop earrings with a hammered texture finish, lightweight and comfortable for all-day wear.',
        price: 3800, category: 'Earrings', subCategory: 'Silver', bestseller: true,
        image: lf('silver,drop,earring,jewelry', 14),
    },

    // ── Earrings · Diamond ───────────────────────────────────────────
    {
        name: 'Diamond Halo Stud Earrings',
        description: 'Brilliant-cut diamond halo stud earrings in platinum settings, where a central diamond is encircled by a dazzling ring of pavé stones.',
        price: 95000, category: 'Earrings', subCategory: 'Diamond', bestseller: true,
        image: lf('diamond,stud,earring,jewelry', 15),
    },
    {
        name: 'Diamond Teardrop Dangle Earrings',
        description: 'Sophisticated diamond teardrop dangle earrings set in 18K white gold, casting prism-like light with every movement.',
        price: 78000, category: 'Earrings', subCategory: 'Diamond', bestseller: false,
        image: lf('diamond,dangle,earring,jewelry', 16),
    },

    // ── Earrings · Pearl ─────────────────────────────────────────────
    {
        name: 'Akoya Pearl Stud Earrings',
        description: 'Perfectly round Akoya cultured pearl studs in sterling silver, offering a luminous, classic look beloved across generations.',
        price: 12000, category: 'Earrings', subCategory: 'Pearl', bestseller: true,
        image: lf('pearl,stud,earring,jewelry', 17),
    },
    {
        name: 'Pearl and Gold Chandelier Earrings',
        description: 'Dramatic chandelier earrings combining freshwater pearls and 18K gold filigree drops for a statement bridal or formal look.',
        price: 19500, category: 'Earrings', subCategory: 'Pearl', bestseller: false,
        image: lf('pearl,chandelier,earring,jewelry', 18),
    },

    // ── Earrings · Gemstone ──────────────────────────────────────────
    {
        name: 'Sapphire and Diamond Halo Earrings',
        description: 'Regal sapphire and diamond halo earrings where vivid blue sapphires are crowned by sparkling diamond pavé in white gold settings.',
        price: 68000, category: 'Earrings', subCategory: 'Gemstone', bestseller: false,
        image: lf('sapphire,gemstone,earring,jewelry', 19),
    },
    {
        name: 'Amethyst Drop Gemstone Earrings',
        description: 'Delicate amethyst drop earrings featuring faceted purple gemstones in a silver bezel setting, bringing a touch of royalty to any outfit.',
        price: 24000, category: 'Earrings', subCategory: 'Gemstone', bestseller: true,
        image: lf('amethyst,gemstone,earring,jewelry', 20),
    },

    // ── Rings · Gold ─────────────────────────────────────────────────
    {
        name: 'Gold Solitaire Engagement Ring',
        description: 'A timeless gold solitaire engagement ring with a brilliant-cut centre stone set in a classic four-prong 22K gold band.',
        price: 55000, category: 'Rings', subCategory: 'Gold', bestseller: true,
        image: lf('gold,solitaire,engagement,ring', 21),
    },
    {
        name: '22K Gold Knuckle Band Ring',
        description: 'A bold 22K gold knuckle band ring with a geometric design, making a confident modern statement on any hand.',
        price: 28000, category: 'Rings', subCategory: 'Gold', bestseller: false,
        image: lf('gold,band,ring,jewelry', 22),
    },

    // ── Rings · Silver ───────────────────────────────────────────────
    {
        name: 'Sterling Silver Adjustable Ring',
        description: 'A versatile sterling silver adjustable ring with an open-band design, comfortable for everyday wear and fits all ring sizes.',
        price: 2800, category: 'Rings', subCategory: 'Silver', bestseller: false,
        image: lf('silver,adjustable,ring,jewelry', 23),
    },
    {
        name: 'Silver Moonstone Cocktail Ring',
        description: 'An ethereal silver cocktail ring showcasing a large oval moonstone with a captivating adularescence, set in a decorative bezel.',
        price: 5500, category: 'Rings', subCategory: 'Silver', bestseller: true,
        image: lf('silver,moonstone,cocktail,ring', 24),
    },

    // ── Rings · Diamond ──────────────────────────────────────────────
    {
        name: 'Diamond Eternity Band Ring',
        description: 'A breathtaking diamond eternity band featuring a continuous row of brilliant-cut diamonds in a polished platinum setting.',
        price: 145000, category: 'Rings', subCategory: 'Diamond', bestseller: true,
        image: lf('diamond,eternity,band,ring', 25),
    },
    {
        name: 'Three-Stone Diamond Ring',
        description: 'A meaningful three-stone diamond ring representing the past, present, and future, set in 18K white gold with milgrain detailing.',
        price: 210000, category: 'Rings', subCategory: 'Diamond', bestseller: false,
        image: lf('diamond,three,stone,ring,jewelry', 26),
    },

    // ── Rings · Pearl ────────────────────────────────────────────────
    {
        name: 'Pearl and Gold Dome Ring',
        description: 'A sculptural dome ring combining a lustrous baroque pearl with a polished 18K gold setting for a bold, artistic statement.',
        price: 18000, category: 'Rings', subCategory: 'Pearl', bestseller: false,
        image: lf('pearl,gold,dome,ring,jewelry', 27),
    },
    {
        name: 'Baroque Pearl Statement Ring',
        description: 'A show-stopping baroque pearl statement ring where an organic-shaped freshwater pearl sits atop an oxidised silver band.',
        price: 14500, category: 'Rings', subCategory: 'Pearl', bestseller: true,
        image: lf('pearl,statement,ring,jewelry', 28),
    },

    // ── Rings · Gemstone ─────────────────────────────────────────────
    {
        name: 'Emerald Cabochon Gold Ring',
        description: 'A luxurious 18K gold ring set with a rich green emerald cabochon, flanked by tapered baguette diamonds for a vintage-inspired look.',
        price: 72000, category: 'Rings', subCategory: 'Gemstone', bestseller: true,
        image: lf('emerald,gemstone,gold,ring', 29),
    },
    {
        name: 'Blue Topaz Gemstone Silver Ring',
        description: 'A sparkling blue topaz cocktail ring in a sterling silver setting, its sky-blue hue evoking clarity and calm.',
        price: 12000, category: 'Rings', subCategory: 'Gemstone', bestseller: false,
        image: lf('topaz,gemstone,silver,ring', 30),
    },

    // ── Bracelets · Gold ─────────────────────────────────────────────
    {
        name: '22K Gold Bangle Set of 6',
        description: 'A traditional set of six 22K gold bangles in varying widths, engraved with floral motifs — a quintessential bridal jewellery staple.',
        price: 85000, category: 'Bracelets', subCategory: 'Gold', bestseller: true,
        image: lf('gold,bangle,bracelet,jewelry', 31),
    },
    {
        name: 'Gold Charm Bracelet with Dangles',
        description: 'A playful 18K gold charm bracelet with seven dangling charms including a star, crescent, and heart — each with personal meaning.',
        price: 42000, category: 'Bracelets', subCategory: 'Gold', bestseller: false,
        image: lf('gold,charm,bracelet,jewelry', 32),
    },

    // ── Bracelets · Silver ───────────────────────────────────────────
    {
        name: 'Sterling Silver Tennis Bracelet',
        description: 'A classic sterling silver tennis bracelet featuring a continuous line of prong-set cubic zirconia stones, elegant and versatile.',
        price: 9500, category: 'Bracelets', subCategory: 'Silver', bestseller: true,
        image: lf('silver,tennis,bracelet,jewelry', 33),
    },
    {
        name: 'Silver Cuff Bracelet with Filigree',
        description: 'A wide silver cuff bracelet adorned with hand-crafted filigree detailing, a wearable work of art inspired by old Karachi silversmithing.',
        price: 6800, category: 'Bracelets', subCategory: 'Silver', bestseller: false,
        image: lf('silver,cuff,bracelet,jewelry', 34),
    },

    // ── Bracelets · Diamond ──────────────────────────────────────────
    {
        name: 'Diamond Line Bracelet',
        description: 'A refined diamond line bracelet featuring forty brilliant-cut diamonds in 18K white gold, the ultimate symbol of understated luxury.',
        price: 175000, category: 'Bracelets', subCategory: 'Diamond', bestseller: false,
        image: lf('diamond,line,bracelet,jewelry', 35),
    },
    {
        name: 'Diamond Cuff Bangle',
        description: 'A bold diamond cuff bangle with pavé-set diamonds on the outer surface of a polished platinum band, commanding instant attention.',
        price: 225000, category: 'Bracelets', subCategory: 'Diamond', bestseller: true,
        image: lf('diamond,cuff,bangle,jewelry', 36),
    },

    // ── Bracelets · Pearl ────────────────────────────────────────────
    {
        name: 'Pearl and Gold Wrap Bracelet',
        description: 'A luxurious wrap bracelet combining freshwater pearls and 18K gold beads on a silk cord, styled for effortless bohemian glamour.',
        price: 25000, category: 'Bracelets', subCategory: 'Pearl', bestseller: true,
        image: lf('pearl,gold,wrap,bracelet,jewelry', 37),
    },
    {
        name: 'Freshwater Pearl Stretch Bracelet',
        description: 'A simple yet elegant freshwater pearl stretch bracelet offering comfort and classic beauty for everyday or special occasions.',
        price: 8500, category: 'Bracelets', subCategory: 'Pearl', bestseller: false,
        image: lf('pearl,stretch,bracelet,jewelry', 38),
    },

    // ── Bracelets · Gemstone ─────────────────────────────────────────
    {
        name: 'Ruby and Gold Hinged Bangle',
        description: 'A stunning hinged bangle in 18K gold inlaid with channel-set rubies along the top surface, exuding festive brilliance.',
        price: 48000, category: 'Bracelets', subCategory: 'Gemstone', bestseller: false,
        image: lf('ruby,gemstone,gold,bangle,jewelry', 39),
    },
    {
        name: 'Multi-Gemstone Beaded Bracelet',
        description: 'A vibrant multi-gemstone beaded bracelet stringing amethyst, turquoise, garnet, and citrine beads on a gold-fill wire for colourful stacking.',
        price: 15000, category: 'Bracelets', subCategory: 'Gemstone', bestseller: true,
        image: lf('gemstone,beaded,bracelet,jewelry', 40),
    },

    // ── Anklets · Gold ───────────────────────────────────────────────
    {
        name: 'Delicate Gold Payal with Ghungroo',
        description: 'A traditional 22K gold payal featuring tiny ghungroo bells that chime softly with each step, an heirloom piece for brides and festive wear.',
        price: 18000, category: 'Anklets', subCategory: 'Gold', bestseller: true,
        image: lf('gold,anklet,foot,jewelry', 41),
    },
    {
        name: '22K Gold Anklet with Charms',
        description: 'A delicate 22K gold anklet featuring small star and crescent charms, adding a whisper of elegance and tradition to every step.',
        price: 24000, category: 'Anklets', subCategory: 'Gold', bestseller: false,
        image: lf('gold,anklet,charm,jewelry', 42),
    },

    // ── Anklets · Silver ─────────────────────────────────────────────
    {
        name: 'Sterling Silver Anklet with Bell',
        description: 'A classic sterling silver anklet with a tiny bell charm that produces a gentle sound with movement — a timeless summer essential.',
        price: 3200, category: 'Anklets', subCategory: 'Silver', bestseller: false,
        image: lf('silver,anklet,bell,foot,jewelry', 43),
    },
    {
        name: 'Silver Twisted Chain Anklet',
        description: 'A minimalist silver twisted chain anklet with a secure lobster-claw clasp, sleek and versatile for beach days or dressed-up evenings.',
        price: 2500, category: 'Anklets', subCategory: 'Silver', bestseller: true,
        image: lf('silver,anklet,chain,foot,jewelry', 44),
    },

    // ── Anklets · Diamond ────────────────────────────────────────────
    {
        name: 'Diamond-Set Gold Anklet',
        description: 'An extraordinary 18K gold anklet with pavé-set diamonds on the central motif, where luxury meets the art of traditional foot adornment.',
        price: 88000, category: 'Anklets', subCategory: 'Diamond', bestseller: true,
        image: lf('diamond,gold,anklet,foot,jewelry', 45),
    },
    {
        name: 'Diamond Charm Anklet',
        description: 'A dainty diamond charm anklet in white gold featuring three sparkling diamond-set charms, elevating any look from the ground up.',
        price: 65000, category: 'Anklets', subCategory: 'Diamond', bestseller: false,
        image: lf('diamond,anklet,charm,foot,jewelry', 46),
    },

    // ── Anklets · Pearl ──────────────────────────────────────────────
    {
        name: 'Pearl Drop Anklet',
        description: 'An enchanting gold anklet with freshwater pearl drops suspended at even intervals, merging the romance of pearls with barefoot elegance.',
        price: 12000, category: 'Anklets', subCategory: 'Pearl', bestseller: false,
        image: lf('pearl,drop,anklet,foot,jewelry', 47),
    },
    {
        name: 'Cultured Pearl Gold Anklet',
        description: 'A sophisticated cultured pearl anklet alternating round pearls with 18K gold beads on a fine gold chain, perfect for bridal celebrations.',
        price: 16500, category: 'Anklets', subCategory: 'Pearl', bestseller: true,
        image: lf('pearl,gold,anklet,foot,jewelry', 48),
    },

    // ── Anklets · Gemstone ───────────────────────────────────────────
    {
        name: 'Turquoise and Silver Anklet',
        description: 'A bohemian turquoise and silver anklet featuring natural turquoise nuggets wrapped in sterling silver wire on a beaded chain.',
        price: 5500, category: 'Anklets', subCategory: 'Gemstone', bestseller: true,
        image: lf('turquoise,gemstone,anklet,foot,jewelry', 49),
    },
    {
        name: 'Coral Bead Gemstone Anklet',
        description: 'A vibrant coral bead anklet with natural orange-red coral stones strung on a gold-fill chain, evoking the warmth of coastal summers.',
        price: 7800, category: 'Anklets', subCategory: 'Gemstone', bestseller: false,
        image: lf('coral,gemstone,beaded,anklet,jewelry', 50),
    },
].map((p) => ({ ...p, date: Date.now() }));

async function seed() {
    await mongoose.connect(`${process.env.MONGODB_URI}/zewar-house`);
    console.log('Connected to MongoDB — zewar-house');

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const result = await Product.insertMany(products);
    console.log(`Inserted ${result.length} products successfully.`);

    await mongoose.disconnect();
    console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
