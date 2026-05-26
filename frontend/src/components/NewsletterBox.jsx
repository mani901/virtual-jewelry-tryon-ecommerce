import { useState } from 'react'
import { toast } from 'react-toastify'
import Spinner from './ui/Spinner'

const NewsletterBox = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSubscribed(true)
    toast.success('You\'re subscribed! Welcome to Zewar House.')
    setLoading(false)
  }

  if (subscribed) {
    return (
      <div className="text-center py-6 animate-fade-in">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-emerald-500">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-lg font-medium text-jewelry-charcoal">You're subscribed!</p>
        <p className="text-sm text-jewelry-stone mt-1">We'll keep you updated on new arrivals and exclusive offers.</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">Subscribe & Discover Our New Arrivals First</p>
      <p className="text-jewelry-stone mt-3 text-sm">
        Be the first to know about new jewellery collections, exclusive offers, and styling inspiration from Zewar House.
      </p>
      <form onSubmit={onSubmitHandler} className="w-full sm:w-1/2 flex items-center gap-0 mx-auto my-6 border border-gray-200 overflow-hidden">
        <input
          className="w-full flex-1 outline-none px-4 py-3 text-sm bg-transparent"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          aria-label="Email address for newsletter"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-jewelry-charcoal text-white text-xs px-8 py-4 hover:bg-jewelry-gold transition-colors duration-200 disabled:opacity-60 flex items-center gap-2 flex-shrink-0"
        >
          {loading && <Spinner size="sm" color="white" />}
          SUBSCRIBE
        </button>
      </form>
    </div>
  )
}

export default NewsletterBox
