import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const Navbar = ({ setToken }) => {
  const handleLogout = () => {
    setToken('')
    toast.success('Logged out successfully')
  }

  return (
    <div className="flex items-center py-3 px-6 justify-between bg-white border-b border-gray-100 shadow-sm">
      <img className="w-[max(8%,70px)]" src={assets.logo} alt="Zewar House" />
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          aria-label="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.068a.75.75 0 1 0-1.064-1.06l-2.5 2.55a.75.75 0 0 0 0 1.06l2.5 2.55a.75.75 0 1 0 1.064-1.06l-1.048-1.069h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
