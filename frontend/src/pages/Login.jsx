import { useContext, useEffect, useRef, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Spinner from '../components/ui/Spinner'

const Login = () => {
  const [currentState, setCurrentState] = useState('Login') // 'Login' | 'Sign Up' | 'Verify OTP'
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)

  // Sign Up / Login fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  // OTP step
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  // pendingName/Email/Password keep the sign-up values alive during OTP step so resend works
  const pendingRef = useRef({ name: '', email: '', password: '' })

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  useEffect(() => { if (token) navigate('/') }, [token])

  const validate = () => {
    const e = {}
    if (currentState === 'Sign Up' && !name.trim()) e.name = 'Name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    return e
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    // OTP verification step
    if (currentState === 'Verify OTP') {
      if (!otp.trim() || otp.length !== 6) {
        toast.error('Please enter the 6-digit code')
        return
      }
      setLoading(true)
      try {
        const response = await axios.post(backendUrl + '/api/user/verify-otp', {
          email: pendingRef.current.email,
          otp,
        })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          toast.success('Account created! Welcome to Zewar House.')
        } else {
          setOtp('')
          toast.error(response.data.message)
        }
      } catch {
        toast.error('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/send-otp', { name, email, password })
        if (response.data.success) {
          pendingRef.current = { name, email, password }
          setCurrentState('Verify OTP')
          setCountdown(60)
          setOtp('')
          toast.success('OTP sent! Check your email.')
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          toast.success('Welcome back!')
        } else {
          toast.error(response.data.message)
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      const { name: n, email: e, password: p } = pendingRef.current
      const response = await axios.post(backendUrl + '/api/user/send-otp', { name: n, email: e, password: p })
      if (response.data.success) {
        setOtp('')
        setCountdown(60)
        toast.success('New OTP sent!')
      } else {
        toast.error(response.data.message)
      }
    } catch {
      toast.error('Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  const switchState = (state) => {
    setCurrentState(state)
    setErrors({})
    setName(''); setEmail(''); setPassword(''); setOtp('')
  }

  const fieldClass = (field) =>
    `w-full px-3 py-2.5 border text-sm outline-none transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-jewelry-charcoal'}`

  // ── OTP verification screen ──────────────────────────────────────────────
  if (currentState === 'Verify OTP') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <form onSubmit={onSubmitHandler} noValidate className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <p className="prata-regular text-3xl">Verify Email</p>
              <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
            </div>
            <p className="text-gray-500 text-sm mt-3">
              We sent a 6-digit code to<br />
              <span className="font-medium text-gray-700">{pendingRef.current.email}</span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <input
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full px-3 py-2.5 border border-gray-300 focus:border-jewelry-charcoal outline-none transition-colors text-center tracking-[0.5em] text-lg font-medium"
                placeholder="000000"
                aria-label="One-time password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-jewelry-charcoal text-white font-light px-8 py-3 hover:bg-jewelry-gold transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Spinner size="sm" color="white" />}
              {loading ? 'Verifying…' : 'Verify & Create Account'}
            </button>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <button
                type="button"
                onClick={() => switchState('Sign Up')}
                className="hover:text-jewelry-charcoal transition-colors"
              >
                ← Back to Sign Up
              </button>
              {countdown > 0
                ? <span>Resend in {countdown}s</span>
                : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="hover:text-jewelry-charcoal transition-colors disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )
              }
            </div>
          </div>
        </form>
      </div>
    )
  }

  // ── Login / Sign Up screen ───────────────────────────────────────────────
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={onSubmitHandler} noValidate className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <p className="prata-regular text-3xl">{currentState}</p>
            <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {currentState === 'Sign Up' && (
            <div>
              <input
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
                onBlur={() => { if (!name.trim()) setErrors(p => ({ ...p, name: 'Name is required' })) }}
                type="text"
                className={fieldClass('name')}
                placeholder="Full Name"
                aria-label="Full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <input
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              onBlur={() => {
                if (!email.trim()) setErrors(p => ({ ...p, email: 'Email is required' }))
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErrors(p => ({ ...p, email: 'Enter a valid email' }))
              }}
              type="email"
              className={fieldClass('email')}
              placeholder="Email Address"
              aria-label="Email address"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <input
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                onBlur={() => { if (!password) setErrors(p => ({ ...p, password: 'Password is required' })) }}
                type={showPassword ? 'text' : 'password'}
                className={`${fieldClass('password')} pr-10`}
                placeholder="Password"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" /><path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" /></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z" clipRule="evenodd" /></svg>
                }
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-between text-xs text-gray-500 -mt-1">
            <button
              type="button"
              onClick={() => toast.info('Password reset coming soon')}
              className="hover:text-jewelry-charcoal transition-colors"
            >
              Forgot your password?
            </button>
            {currentState === 'Login'
              ? <button type="button" onClick={() => switchState('Sign Up')} className="hover:text-jewelry-charcoal transition-colors">Create account</button>
              : <button type="button" onClick={() => switchState('Login')} className="hover:text-jewelry-charcoal transition-colors">Login Here</button>
            }
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-jewelry-charcoal text-white font-light px-8 py-3 mt-2 hover:bg-jewelry-gold transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner size="sm" color="white" />}
            {loading
              ? (currentState === 'Sign Up' ? 'Sending OTP…' : 'Please wait…')
              : (currentState === 'Login' ? 'Sign In' : 'Send OTP')
            }
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
