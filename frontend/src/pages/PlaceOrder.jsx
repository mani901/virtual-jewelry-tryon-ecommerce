import { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import Spinner from '../components/ui/Spinner'

const inputClass = 'border border-gray-200 rounded-lg py-3 px-4 w-full text-sm outline-none focus:border-jewelry-charcoal focus:ring-1 focus:ring-jewelry-charcoal/10 transition-all placeholder:text-gray-400 bg-white'
const labelClass = 'block text-xs font-medium text-jewelry-stone mb-1.5'

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
    <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
  </svg>
)

const Step = ({ num, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${done ? 'bg-jewelry-gold text-white' : active ? 'bg-jewelry-charcoal text-white' : 'bg-gray-100 text-gray-400'}`}>
      {done ? <CheckIcon /> : num}
    </div>
    <span className={`text-xs font-medium hidden sm:block transition-colors ${active ? 'text-jewelry-charcoal' : done ? 'text-jewelry-stone' : 'text-gray-300'}`}>{label}</span>
  </div>
)

const StepDivider = () => <div className="flex-1 h-px bg-gray-200 mx-1 sm:mx-2 max-w-16" />

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, currency } = useContext(ShopContext)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', street: '',
    city: '', state: '', zipcode: '', country: '', phone: ''
  })

  const onChangeHandler = (e) => {
    setFormData(data => ({ ...data, [e.target.name]: e.target.value }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const orderItems = []
      for (const itemId in cartItems) {
        if (cartItems[itemId] > 0) {
          const itemInfo = structuredClone(products.find(p => p._id === itemId))
          if (itemInfo) { itemInfo.quantity = cartItems[itemId]; orderItems.push(itemInfo) }
        }
      }

      const orderData = { address: formData, items: orderItems, amount: getCartAmount() + delivery_fee }

      if (method === 'cod') {
        const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })
        if (response.data.success) {
          toast.success('Order placed successfully!')
          setCartItems({})
          navigate('/orders')
        } else {
          toast.error(response.data.message)
        }
      } else if (method === 'stripe') {
        const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } })
        if (responseStripe.data.success) {
          window.location.replace(responseStripe.data.session_url)
        } else {
          toast.error(responseStripe.data.message)
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cartData = Object.entries(cartItems)
    .filter(([, qty]) => qty > 0)
    .map(([id, quantity]) => ({ product: products.find(p => p._id === id), quantity }))
    .filter(item => item.product)

  const subtotal = getCartAmount()
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee
  const itemCount = cartData.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="border-t pt-10 pb-20 animate-fade-in">

      {/* Progress stepper */}
      <div className="flex items-center mb-10">
        <Step num={1} label="Cart" done />
        <StepDivider />
        <Step num={2} label="Details" active />
        <StepDivider />
        <Step num={3} label="Confirmation" />
      </div>

      <form onSubmit={onSubmitHandler}>
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT: Delivery Form ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">
            <h1 className="text-2xl font-medium text-jewelry-charcoal">Delivery Information</h1>

            {/* Contact card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-jewelry-charcoal mb-5 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-jewelry-blush flex items-center justify-center text-jewelry-charcoal text-xs font-bold flex-shrink-0">1</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>First Name</label>
                    <input
                      id="firstName"
                      required
                      onChange={onChangeHandler}
                      name="firstName"
                      value={formData.firstName}
                      className={inputClass}
                      type="text"
                      placeholder="Ayesha"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>Last Name</label>
                    <input
                      id="lastName"
                      required
                      onChange={onChangeHandler}
                      name="lastName"
                      value={formData.lastName}
                      className={inputClass}
                      type="text"
                      placeholder="Khan"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email Address</label>
                  <input
                    id="email"
                    required
                    onChange={onChangeHandler}
                    name="email"
                    value={formData.email}
                    className={inputClass}
                    type="email"
                    placeholder="ayesha@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone Number</label>
                  <input
                    id="phone"
                    required
                    onChange={onChangeHandler}
                    name="phone"
                    value={formData.phone}
                    className={inputClass}
                    type="tel"
                    placeholder="+92 317 1234567"
                  />
                </div>
              </div>
            </div>

            {/* Address card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-jewelry-charcoal mb-5 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-jewelry-blush flex items-center justify-center text-jewelry-charcoal text-xs font-bold flex-shrink-0">2</span>
                Delivery Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="street" className={labelClass}>Street Address</label>
                  <input
                    id="street"
                    required
                    onChange={onChangeHandler}
                    name="street"
                    value={formData.street}
                    className={inputClass}
                    type="text"
                    placeholder="House #5, Block B, Valencia Town"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className={labelClass}>City</label>
                    <input
                      id="city"
                      required
                      onChange={onChangeHandler}
                      name="city"
                      value={formData.city}
                      className={inputClass}
                      type="text"
                      placeholder="Lahore"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className={labelClass}>Province</label>
                    <input
                      id="state"
                      required
                      onChange={onChangeHandler}
                      name="state"
                      value={formData.state}
                      className={inputClass}
                      type="text"
                      placeholder="Punjab"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="zipcode" className={labelClass}>Postal Code</label>
                    <input
                      id="zipcode"
                      required
                      onChange={onChangeHandler}
                      name="zipcode"
                      value={formData.zipcode}
                      className={inputClass}
                      type="text"
                      placeholder="54000"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className={labelClass}>Country</label>
                    <input
                      id="country"
                      required
                      onChange={onChangeHandler}
                      name="country"
                      value={formData.country}
                      className={inputClass}
                      type="text"
                      placeholder="Pakistan"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Summary + Payment + CTA ───────────────────────────── */}
          <div className="w-full lg:w-[360px] xl:w-[400px] lg:sticky lg:top-8 flex-shrink-0 space-y-4">

            {/* Order summary card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-jewelry-blush border-b border-gray-100">
                <h2 className="font-semibold text-jewelry-charcoal">Order Summary</h2>
                <p className="text-xs text-jewelry-stone mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              </div>

              <div className="px-6 py-5">
                {/* Product thumbnails */}
                {cartData.length > 0 && (
                  <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                    {cartData.map(({ product: p, quantity }) => (
                      <div key={p._id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-jewelry-blush flex-shrink-0 border border-gray-100">
                          <img src={p.image?.[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-jewelry-charcoal truncate leading-snug">{p.name}</p>
                          <p className="text-xs text-jewelry-stone mt-0.5">{p.category} <span className="text-gray-300">×{quantity}</span></p>
                        </div>
                        <p className="text-xs font-semibold text-jewelry-charcoal flex-shrink-0">{currency}{(p.price * quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}

                <hr className="border-gray-100 mb-4" />

                {/* Totals */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-jewelry-stone">Subtotal</span>
                    <span className="font-medium text-jewelry-charcoal">{currency}{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-jewelry-stone">Delivery</span>
                    <span className="font-medium text-jewelry-charcoal">{currency}{delivery_fee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-jewelry-charcoal">Total</span>
                  <span className="text-xl font-bold text-jewelry-charcoal">{currency}{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment + CTA card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-jewelry-blush border-b border-gray-100">
                <h2 className="font-semibold text-jewelry-charcoal">Payment Method</h2>
              </div>

              <div className="px-6 py-5 space-y-3">
                {/* COD */}
                <button
                  type="button"
                  onClick={() => setMethod('cod')}
                  aria-pressed={method === 'cod'}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3.5 transition-all text-left ${method === 'cod' ? 'border-jewelry-charcoal bg-jewelry-blush' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${method === 'cod' ? 'border-jewelry-charcoal' : 'border-gray-300'}`}>
                    {method === 'cod' && <div className="w-2 h-2 rounded-full bg-jewelry-charcoal" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-jewelry-stone flex-shrink-0">
                      <path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.33.576Z" />
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-6a.75.75 0 0 1 .75.75v.316a3.78 3.78 0 0 1 1.653.713c.426.33.744.74.925 1.2a.75.75 0 0 1-1.395.55 1.35 1.35 0 0 0-.447-.563 2.187 2.187 0 0 0-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 0 1-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 1 1 1.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 0 1-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 0 1 1.653-.713V4.75A.75.75 0 0 1 10 4Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-jewelry-charcoal">Cash on Delivery</span>
                  </div>
                  {method === 'cod' && <span className="ml-auto text-[10px] font-semibold bg-jewelry-charcoal text-white px-2 py-0.5 rounded-full">Selected</span>}
                </button>

                {/* Stripe */}
                <button
                  type="button"
                  onClick={() => setMethod('stripe')}
                  aria-pressed={method === 'stripe'}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3.5 transition-all text-left ${method === 'stripe' ? 'border-jewelry-charcoal bg-jewelry-blush' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${method === 'stripe' ? 'border-jewelry-charcoal' : 'border-gray-300'}`}>
                    {method === 'stripe' && <div className="w-2 h-2 rounded-full bg-jewelry-charcoal" />}
                  </div>
                  <img className="h-5" src={assets.stripe_logo} alt="Stripe" />
                  {method === 'stripe' && <span className="ml-auto text-[10px] font-semibold bg-jewelry-charcoal text-white px-2 py-0.5 rounded-full">Selected</span>}
                </button>

                {/* Razorpay */}
                <button
                  type="button"
                  onClick={() => setMethod('razorpay')}
                  aria-pressed={method === 'razorpay'}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3.5 transition-all text-left ${method === 'razorpay' ? 'border-jewelry-charcoal bg-jewelry-blush' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${method === 'razorpay' ? 'border-jewelry-charcoal' : 'border-gray-300'}`}>
                    {method === 'razorpay' && <div className="w-2 h-2 rounded-full bg-jewelry-charcoal" />}
                  </div>
                  <img className="h-5" src={assets.razorpay_logo} alt="Razorpay" />
                  {method === 'razorpay' && <span className="ml-auto text-[10px] font-semibold bg-jewelry-charcoal text-white px-2 py-0.5 rounded-full">Selected</span>}
                </button>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-jewelry-charcoal text-white py-3.5 text-sm font-medium tracking-wide hover:bg-jewelry-gold transition-colors duration-200 disabled:opacity-60 rounded-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" color="white" />
                        Placing Order…
                      </>
                    ) : (
                      <>
                        Place Order
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M2.22 2.22a.75.75 0 0 1 1.06 0l10.5 10.5a.75.75 0 0 1-1.06 1.06L2.22 3.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M14.78 2.22a.75.75 0 0 1 0 1.06L4.28 13.78a.75.75 0 1 1-1.06-1.06L13.72 2.22a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Security note */}
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-gray-300">
                      <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-[11px] text-gray-300">Secured checkout · SSL encrypted</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  )
}

export default PlaceOrder
