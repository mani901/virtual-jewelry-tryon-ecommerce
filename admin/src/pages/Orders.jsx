import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import EmptyState from '../components/ui/EmptyState'
import { OrderCardSkeleton } from '../components/ui/Skeleton'
import Spinner from '../components/ui/Spinner'

const STATUS_OPTIONS = ['Order Placed', 'Packing', 'Shipped', 'Out of delivery', 'Delivered']

const statusColors = {
  'Order Placed': 'bg-blue-100 text-blue-700',
  'Packing': 'bg-amber-100 text-amber-700',
  'Shipped': 'bg-purple-100 text-purple-700',
  'Out of delivery': 'bg-orange-100 text-orange-700',
  'Delivered': 'bg-emerald-100 text-emerald-700',
}

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const fetchAllOrders = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (event, orderId) => {
    setUpdatingId(orderId)
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
        toast.success('Order status updated')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => { fetchAllOrders() }, [token])

  const filtered = orders.filter(order => {
    const name = `${order.address?.firstName ?? ''} ${order.address?.lastName ?? ''}`.toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || order.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer name…"
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-56 outline-none focus:border-admin-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-admin-accent text-gray-700"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-0 divide-y border rounded-xl overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border rounded-xl">
          <EmptyState
            icon="clipboard-list"
            title={orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
            subtitle={orders.length === 0 ? 'Orders will appear here once customers start buying' : 'Try changing the filter or search term'}
            cta={statusFilter !== 'All' || search ? { label: 'Clear filters', onClick: () => { setSearch(''); setStatusFilter('All') } } : undefined}
          />
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden divide-y bg-white">
          {filtered.map((order) => (
            <div key={order._id} className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3 lg:block">
                <img className="w-12 h-12 object-contain" src={assets.parcel_icon} alt="Order" />
                <div className="lg:hidden">
                  <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1 ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-xs text-gray-400 font-mono mb-1">#{order._id.slice(-6).toUpperCase()}</div>
                <div className="text-sm text-gray-700 space-y-0.5 mb-2">
                  {order.items.map((item, i) => (
                    <p key={i} className="truncate">{item.name} <span className="text-gray-400">×{item.quantity}</span></p>
                  ))}
                </div>
                <p className="font-semibold text-sm text-gray-900">{order.address.firstName} {order.address.lastName}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{order.address.street}, {order.address.city}</p>
                <p className="text-xs text-gray-400">{order.address.phone}</p>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="text-gray-400">Items:</span> {order.items.length}</p>
                <p><span className="text-gray-400">Method:</span> {order.paymentMethod}</p>
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${order.payment ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.payment ? 'Paid' : 'Pending'}
                </span>
                <p className="text-gray-400">{new Date(order.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>

              <p className="text-sm font-semibold text-gray-900">{currency}{order.amount.toLocaleString()}</p>

              <div className="flex items-center gap-2">
                {updatingId === order._id && <Spinner size="sm" color="dark" />}
                <select
                  onChange={e => statusHandler(e, order._id)}
                  value={order.status}
                  disabled={updatingId === order._id}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:border-admin-accent font-medium disabled:opacity-50 w-full"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
