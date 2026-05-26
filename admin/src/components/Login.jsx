import { useState } from 'react'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import Spinner from './ui/Spinner'

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!email) e.email = 'Email is required'
    if (!password) e.password = 'Password is required'
    return e
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
      if (response.data.success) {
        setToken(response.data.token)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-muted px-4">
      <div className="bg-white shadow-lg rounded-2xl px-8 py-8 w-full max-w-sm border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-admin-accent-light rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-admin-accent">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Zewar House Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your dashboard</p>
        </div>

        <form onSubmit={onSubmitHandler} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="admin-email">Email Address</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              onBlur={() => { if (!email) setErrors(p => ({ ...p, email: 'Email is required' })) }}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-admin-accent'} outline-none`}
              placeholder="admin@zewarhouse.pk"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="admin-password">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                onBlur={() => { if (!password) setErrors(p => ({ ...p, password: 'Password is required' })) }}
                className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-admin-accent'} outline-none`}
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-admin-sidebar text-white font-medium text-sm hover:bg-slate-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Spinner size="sm" color="white" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
