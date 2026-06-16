import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import Title from '../components/Title'

const Wishlist = () => {
  const { products, currency, wishlistItems, removeFromWishlist, addToCart } = useContext(ShopContext)

  const wishlistProducts = products.filter(p => wishlistItems[p._id])

  const handleMoveToCart = (productId) => {
    addToCart(productId, 1)
    removeFromWishlist(productId)
    toast.success('Moved to cart!')
  }

  return (
    <div className="border-t pt-14 min-h-[60vh]">
      <div className="text-2xl mb-8">
        <Title text1="MY " text2="WISHLIST" />
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-200 mb-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-jewelry-stone text-lg mb-2">Your wishlist is empty</p>
          <p className="text-sm text-gray-400 mb-8">Save pieces you love and find them here later</p>
          <Link
            to="/collection"
            className="bg-jewelry-charcoal text-white px-8 py-3 text-sm hover:bg-jewelry-gold transition-colors duration-200"
          >
            BROWSE COLLECTION
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-10">
          {wishlistProducts.map(product => (
            <div key={product._id} className="group">
              <Link to={`/product/${product._id}`} className="block relative">
                <div className="overflow-hidden rounded-sm bg-jewelry-blush relative">
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeFromWishlist(product._id)
                      toast.success('Removed from wishlist')
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-2.184C4.045 12.376 2 9.515 2 6.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 6.5c0 3.015-2.045 5.876-3.885 7.536a22.049 22.049 0 0 1-3.744 2.865l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
                    </svg>
                  </button>
                </div>
                <p className="pt-3 pb-0.5 text-sm font-medium text-jewelry-charcoal line-clamp-1">{product.name}</p>
                <p className="text-sm text-jewelry-stone">{currency}{product.price.toLocaleString()}</p>
              </Link>
              <button
                onClick={() => handleMoveToCart(product._id)}
                className="mt-2 w-full border border-jewelry-charcoal text-jewelry-charcoal text-xs py-2 hover:bg-jewelry-charcoal hover:text-white transition-colors duration-200"
              >
                MOVE TO CART
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
