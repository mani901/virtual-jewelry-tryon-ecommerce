import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const HeartIcon = ({ filled }) => filled
  ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500"><path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-2.184C4.045 12.376 2 9.515 2 6.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 6.5c0 3.015-2.045 5.876-3.885 7.536a22.049 22.049 0 0 1-3.744 2.865l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" /></svg>
  : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const { setShowSearch, getCartCount, token, setToken, setCartItems, getWishlistCount, setWishlistItems } = useContext(ShopContext)
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('wishlistItems')
    setToken('')
    setCartItems({})
    setWishlistItems({})
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 text-sm transition-colors ${isActive ? 'text-jewelry-charcoal' : 'text-jewelry-stone hover:text-jewelry-charcoal'}`

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to="/"><img src={assets.logo} className="w-36" alt="Zewar House" /></Link>

      <ul className="hidden sm:flex gap-6 text-sm">
        {[['/', 'HOME'], ['/collection', 'COLLECTION'], ['/about', 'ABOUT'], ['/contact', 'CONTACT']].map(([path, label]) => (
          <NavLink key={path} to={path} end={path === '/'} className={navLinkClass}>
            <p>{label}</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-jewelry-charcoal hidden" />
          </NavLink>
        ))}
      </ul>

      <div className="flex items-center gap-5">
        <button
          onClick={() => { setShowSearch(true); navigate('/collection') }}
          className="hover:text-jewelry-gold transition-colors"
          aria-label="Search"
        >
          <img src={assets.search_icon} className="w-5" alt="Search" />
        </button>

        <Link to="/wishlist" className="relative hover:text-jewelry-gold transition-colors" aria-label={`Wishlist (${getWishlistCount()} items)`}>
          <HeartIcon filled={getWishlistCount() > 0} />
          {getWishlistCount() > 0 && (
            <span className="absolute -right-1.5 -bottom-1.5 w-4 text-center leading-4 bg-red-500 text-white aspect-square rounded-full text-[8px] font-medium">
              {getWishlistCount()}
            </span>
          )}
        </Link>

        <div className="group relative">
          <button
            onClick={() => { if (!token) navigate('/login') }}
            className="hover:text-jewelry-gold transition-colors"
            aria-label="Account"
          >
            <img className="w-5 cursor-pointer" src={assets.profile_icon} alt="Account" />
          </button>
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50">
              <div className="flex flex-col gap-1 w-40 py-3 px-4 bg-white shadow-lg border border-gray-100 rounded-lg text-sm text-gray-600">
                <Link to="/wishlist" className="py-1 hover:text-jewelry-charcoal transition-colors">My Wishlist</Link>
                <Link to="/orders" className="py-1 hover:text-jewelry-charcoal transition-colors">My Orders</Link>
                <button onClick={logout} className="text-left py-1 hover:text-red-500 transition-colors">Logout</button>
              </div>
            </div>
          )}
        </div>

        <Link to="/cart" className="relative hover:text-jewelry-gold transition-colors" aria-label={`Cart (${getCartCount()} items)`}>
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
          {getCartCount() > 0 && (
            <span className="absolute -right-1.5 -bottom-1.5 w-4 text-center leading-4 bg-jewelry-charcoal text-white aspect-square rounded-full text-[8px] font-medium">
              {getCartCount()}
            </span>
          )}
        </Link>

        <button
          onClick={() => setVisible(true)}
          className="sm:hidden"
          aria-label="Open menu"
        >
          <img src={assets.menu_icon} className="w-5" alt="Menu" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${visible ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={() => setVisible(false)} />
        <div className={`absolute top-0 right-0 bottom-0 bg-white w-72 shadow-xl transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col text-gray-600">
            <button onClick={() => setVisible(false)} className="flex items-center gap-3 p-4 border-b hover:bg-gray-50" aria-label="Close menu">
              <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="" />
              <p className="text-sm font-medium">Close</p>
            </button>
            {[['/', 'HOME'], ['/collection', 'COLLECTION'], ['/about', 'ABOUT'], ['/contact', 'CONTACT']].map(([path, label]) => (
              <NavLink
                key={path}
                onClick={() => setVisible(false)}
                className={({ isActive }) => `py-3 pl-6 border-b text-sm ${isActive ? 'text-jewelry-charcoal font-medium' : 'hover:text-jewelry-charcoal'}`}
                to={path}
                end={path === '/'}
              >
                {label}
              </NavLink>
            ))}
            {token && (
              <>
                <Link onClick={() => setVisible(false)} to="/wishlist" className="py-3 pl-6 border-b text-sm hover:text-jewelry-charcoal">MY WISHLIST</Link>
                <Link onClick={() => setVisible(false)} to="/orders" className="py-3 pl-6 border-b text-sm hover:text-jewelry-charcoal">MY ORDERS</Link>
                <button onClick={() => { setVisible(false); logout() }} className="text-left py-3 pl-6 text-sm text-red-500 hover:text-red-600">LOGOUT</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
