import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import EmptyState from '../components/ui/EmptyState'
import QuantitySelector from '../components/ui/QuantitySelector'

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
  </svg>
)

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, delivery_fee, getCartAmount } = useContext(ShopContext)
  const [cartData, setCartData] = useState([])

  useEffect(() => {
    if (products.length > 0) {
      const tempData = []
      for (const productId in cartItems) {
        if (cartItems[productId] > 0) {
          tempData.push({ _id: productId, quantity: cartItems[productId] })
        }
      }
      setCartData(tempData)
    }
  }, [cartItems, products])

  const handleRemove = (id, name) => {
    updateQuantity(id, 0)
    toast.success(`${name} removed from cart`)
  }

  const subtotal = getCartAmount()
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee
  const itemCount = cartData.reduce((sum, i) => sum + i.quantity, 0)

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (cartData.length === 0) {
    return (
      <div className="border-t pt-14 min-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-medium text-jewelry-charcoal">
            Your Cart <span className="text-jewelry-stone font-normal text-lg">(0 items)</span>
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="shopping-bag"
            title="Your cart is empty"
            subtitle="Discover our curated jewellery collections and find your perfect piece"
            cta={{ label: 'Browse Collection', href: '/collection' }}
          />
        </div>
      </div>
    )
  }

  // ── Cart with items ───────────────────────────────────────────────────────
  return (
    <div className="border-t pt-10 pb-20 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium text-jewelry-charcoal">
          Your Cart <span className="text-jewelry-stone font-normal text-lg">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        </h1>
        <Link to="/collection" className="text-sm text-jewelry-stone hover:text-jewelry-gold transition-colors flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M11.78 11.78a.75.75 0 0 1-1.06 0L6.22 7.28a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L7.81 6.75l3.97 3.97a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT: Cart Items ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Column headers — desktop only */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 pb-3 border-b border-gray-100 text-xs font-semibold text-jewelry-stone uppercase tracking-wider">
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Price</span>
            <span />
          </div>

          <div className="divide-y divide-gray-100">
            {cartData.map((item) => {
              const p = products.find(prod => prod._id === item._id)
              if (!p) return null
              const lineTotal = p.price * item.quantity

              return (
                <div key={item._id} className="py-6 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 md:gap-6 items-center group">

                  {/* Product info */}
                  <div className="flex gap-4 items-start">
                    <Link to={`/product/${p._id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-jewelry-blush border border-gray-100">
                        <img
                          src={p.image?.[0]}
                          alt={p.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${p._id}`}>
                        <p className="font-medium text-jewelry-charcoal text-sm sm:text-base leading-snug hover:text-jewelry-gold transition-colors line-clamp-2">{p.name}</p>
                      </Link>
                      <p className="text-xs text-jewelry-stone mt-1">{p.category} · {p.subCategory}</p>
                      <p className="text-sm font-medium text-jewelry-charcoal mt-1.5">{currency}{p.price.toLocaleString()}</p>

                      {/* Remove — mobile only */}
                      <button
                        onClick={() => handleRemove(p._id, p.name)}
                        className="md:hidden flex items-center gap-1 text-xs text-jewelry-stone hover:text-red-500 transition-colors mt-3"
                        aria-label={`Remove ${p.name}`}
                      >
                        <TrashIcon /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex md:justify-center">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(val) => updateQuantity(item._id, val)}
                    />
                  </div>

                  {/* Line total */}
                  <p className="text-right text-sm font-semibold text-jewelry-charcoal hidden md:block">
                    {currency}{lineTotal.toLocaleString()}
                  </p>

                  {/* Remove — desktop only */}
                  <button
                    onClick={() => handleRemove(p._id, p.name)}
                    className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    aria-label={`Remove ${p.name}`}
                  >
                    <TrashIcon />
                  </button>

                </div>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT: Order Summary ─────────────────────────────────────────── */}
        <div className="w-full lg:w-[340px] xl:w-[380px] lg:sticky lg:top-8 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

            {/* Summary header */}
            <div className="px-6 py-4 bg-jewelry-blush border-b border-gray-100">
              <h2 className="font-semibold text-jewelry-charcoal text-base">Order Summary</h2>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Line items */}
              <div className="space-y-2">
                {cartData.map((item) => {
                  const p = products.find(prod => prod._id === item._id)
                  if (!p) return null
                  return (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-jewelry-stone truncate mr-3 flex-1">{p.name} <span className="text-gray-300">×{item.quantity}</span></span>
                      <span className="font-medium text-jewelry-charcoal flex-shrink-0">{currency}{(p.price * item.quantity).toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>

              <hr className="border-gray-100" />

              {/* Subtotal / Shipping / Total */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-jewelry-stone">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                  <span className="font-medium text-jewelry-charcoal">{currency}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-jewelry-stone">Shipping</span>
                  <span className="font-medium text-jewelry-charcoal">{currency}{delivery_fee.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-jewelry-charcoal">Total</span>
                <span className="text-xl font-bold text-jewelry-charcoal">{currency}{total.toLocaleString()}</span>
              </div>

              {/* Trust note */}
              <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-500 flex-shrink-0">
                  <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-emerald-700 font-medium">100% secure checkout · Cash on delivery available</p>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate('/place-order')}
                className="w-full bg-jewelry-charcoal text-white py-3.5 text-sm font-medium tracking-wide hover:bg-jewelry-gold transition-colors duration-200 rounded-lg flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2.22 2.22a.75.75 0 0 1 1.06 0l10.5 10.5a.75.75 0 0 1-1.06 1.06L2.22 3.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M14.78 2.22a.75.75 0 0 1 0 1.06L4.28 13.78a.75.75 0 1 1-1.06-1.06L13.72 2.22a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Policy links */}
              <div className="flex justify-center gap-4 text-[11px] text-gray-300 pt-1">
                <span>30-day returns</span>
                <span>·</span>
                <span>Authentic & certified</span>
                <span>·</span>
                <span>COD nationwide</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Cart
