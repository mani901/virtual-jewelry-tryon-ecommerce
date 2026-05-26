import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Hero = () => (
  <div className="flex flex-col sm:flex-row border border-gray-200 overflow-hidden">
    <div className="w-full sm:w-1/2 flex items-center justify-center py-12 sm:py-0">
      <motion.div
        className="text-jewelry-charcoal px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 md:w-11 h-[2px] bg-jewelry-charcoal" />
          <p className="font-medium text-sm md:text-base tracking-wider">OUR FINEST COLLECTIONS</p>
        </div>

        <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed text-jewelry-charcoal">
          Timeless Elegance
        </h1>

        <Link to="/collection" className="flex items-center gap-2 mt-2 group">
          <p className="font-semibold text-sm md:text-base group-hover:text-jewelry-gold transition-colors">EXPLORE NOW</p>
          <div className="w-8 md:w-11 h-[1px] bg-jewelry-charcoal group-hover:bg-jewelry-gold transition-colors" />
        </Link>
      </motion.div>
    </div>
    <img className="w-full sm:w-1/2 object-cover" src={assets.hero_img} alt="Zewar House — Timeless Jewellery" />
  </div>
)

export default Hero
