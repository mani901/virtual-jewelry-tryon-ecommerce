import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Badge from './ui/Badge'

const ProductItem = ({ id, image, name, price, bestseller, isNew }) => {
  const { currency, addToCart } = useContext(ShopContext)

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(id, 1)
    toast.success('Added to cart!')
  }

  return (
    <Link className="text-gray-700 cursor-pointer group" to={`/product/${id}`}>
      <div className="overflow-hidden relative rounded-sm bg-jewelry-blush">
        <img
          className="w-full aspect-[3/4] object-cover hover:scale-105 transition-transform duration-500 ease-out"
          src={image[0]}
          alt={name}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {bestseller && <Badge variant="bestseller" label="Bestseller" />}
          {isNew && !bestseller && <Badge variant="new" label="New" />}
        </div>
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:bg-jewelry-charcoal hover:text-white"
          aria-label={`Add ${name} to cart`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.18 3a65.25 65.25 0 0 1 13.9 1.88.75.75 0 0 1 .566.954l-1.955 6.502a1.75 1.75 0 0 1-1.687 1.264h-8.81a1.75 1.75 0 0 1-1.728-1.464L3.15 5.143v-.002l-.38-2.65A.25.25 0 0 0 2.523 2.5H1.75A.75.75 0 0 1 1 1.75ZM5.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM16 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          </svg>
        </button>
      </div>
      <p className="pt-3 pb-0.5 text-sm font-medium text-jewelry-charcoal line-clamp-1">{name}</p>
      <p className="text-sm text-jewelry-stone">{currency}{price.toLocaleString()}</p>
    </Link>
  )
}

export const ProductItemSkeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="aspect-[3/4] w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-sm" />
    <div className="h-4 w-3/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded" />
    <div className="h-4 w-1/3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded" />
  </div>
)

export default ProductItem
