import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => (
  <div className="my-10 mt-40 px-6 text-sm">
    <div className="grid sm:grid-cols-[2fr_1fr_1fr] gap-14">
      <div>
        <img src={assets.logo} className="mb-5 w-32" alt="Zewar House Logo" />
        <p className="w-full md:w-2/3 text-jewelry-stone leading-relaxed">
          Zewar House is Pakistan's trusted destination for authentic, hallmark-certified women's jewellery. Where every piece tells a story.
        </p>
      </div>

      <div>
        <p className="text-xl font-medium mb-5">COMPANY</p>
        <ul className="flex flex-col gap-2 text-jewelry-stone">
          <li><Link to="/" className="hover:text-jewelry-charcoal transition-colors">Home</Link></li>
          <li><Link to="/about" className="hover:text-jewelry-charcoal transition-colors">About Us</Link></li>
          <li><Link to="/collection" className="hover:text-jewelry-charcoal transition-colors">Collection</Link></li>
          <li><Link to="/contact" className="hover:text-jewelry-charcoal transition-colors">Contact Us</Link></li>
        </ul>
      </div>

      <div>
        <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
        <ul className="flex flex-col gap-2 text-jewelry-stone">
          <li>
            <a href="tel:+923171234567" className="hover:text-jewelry-charcoal transition-colors">+92 317 1234567</a>
          </li>
          <li>
            <a href="mailto:support@zewarhouse.pk" className="hover:text-jewelry-charcoal transition-colors">support@zewarhouse.pk</a>
          </li>
        </ul>
      </div>
    </div>

    <div className="mt-10">
      <hr className="border-gray-100" />
      <p className="py-5 text-sm text-center text-jewelry-stone">
        Copyright {new Date().getFullYear()} &copy; Zewar House — All Rights Reserved.
      </p>
    </div>
  </div>
)

export default Footer
