import { useLocation } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Verify from './pages/Verify'
import Wishlist from './pages/Wishlist'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import PageTransition from './components/ui/PageTransition'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/collection" element={<PageTransition><Collection /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/product/:productId" element={<PageTransition><Product /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/place-order" element={<PageTransition><PlaceOrder /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><Orders /></PageTransition>} />
        <Route path="/verify" element={<PageTransition><Verify /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

const App = () => (
  <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] bg-jewelry-cream min-h-screen">
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    <Navbar />
    <SearchBar />
    <AnimatedRoutes />
    <Footer />
  </div>
)

export default App
