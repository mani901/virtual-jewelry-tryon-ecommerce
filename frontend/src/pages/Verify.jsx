import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import Spinner from '../components/ui/Spinner'

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const success = searchParams.get('success')
  const orderId = searchParams.get('orderId')

  const verifyPayment = async () => {
    if (!token) return
    try {
      const response = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, { headers: { token } })
      if (response.data.success) {
        setStatus('success')
        setCartItems({})
        toast.success('Payment confirmed! Your order is placed.')
        setTimeout(() => navigate('/orders'), 2000)
      } else {
        setStatus('failed')
        setTimeout(() => navigate('/cart'), 2500)
      }
    } catch (error) {
      setStatus('failed')
      toast.error('Payment verification failed.')
      setTimeout(() => navigate('/cart'), 2500)
    }
  }

  useEffect(() => { verifyPayment() }, [token])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
      {status === 'verifying' && (
        <>
          <Spinner size="lg" color="gold" />
          <p className="text-jewelry-stone text-sm">Verifying your payment…</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-emerald-500">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-medium text-jewelry-charcoal">Payment Confirmed!</p>
          <p className="text-jewelry-stone text-sm">Redirecting to your orders…</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-medium text-jewelry-charcoal">Payment Failed</p>
          <p className="text-jewelry-stone text-sm">Redirecting back to your cart…</p>
        </>
      )}
    </div>
  )
}

export default Verify
