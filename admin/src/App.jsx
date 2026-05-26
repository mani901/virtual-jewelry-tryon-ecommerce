import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'

import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Dashboard from './pages/Dashboard'
import Login from './components/Login'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₨'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ?? '')

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  // Auto-logout when backend rejects the token (invalid signature / expired)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setToken('')
          localStorage.removeItem('token')
          toast.error('Session expired. Please log in again.')
        }
        return Promise.reject(err)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [])

  return (
    <div className="bg-admin-muted min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <div className="flex w-full">
            <Sidebar />
            <div className="flex-1 min-w-0 px-6 py-8 max-w-5xl">
              <Routes>
                <Route path="/" element={<Dashboard token={token} />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
