import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import StatCard from '../components/ui/StatCard'
import Skeleton from '../components/ui/Skeleton'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const STATUS_COLORS = {
  'Order Placed': '#3B82F6',
  'Packing': '#F59E0B',
  'Shipped': '#8B5CF6',
  'Out of delivery': '#F97316',
  'Delivered': '#10B981',
  'Cancelled': '#EF4444',
}

const getLast7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }))
  }
  return days
}

const Dashboard = ({ token }) => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [pRes, oRes] = await Promise.all([
          axios.get(backendUrl + '/api/product/list'),
          axios.post(backendUrl + '/api/order/list', {}, { headers: { token } }),
        ])
        if (pRes.data.success) setProducts(pRes.data.products)
        if (oRes.data.success) setOrders(oRes.data.orders)
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchData()
  }, [token])

  const totalRevenue = orders.filter(o => o.payment).reduce((sum, o) => sum + o.amount, 0)
  const pendingOrders = orders.filter(o => o.status !== 'Delivered').length

  const last7Days = getLast7Days()
  const salesData = last7Days.map(day => {
    const count = orders.filter(o => {
      const d = new Date(o.date)
      return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }) === day
    }).length
    return { day, orders: count }
  })

  const statusMap = {}
  orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1 })
  const pieData = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

  const recentOrders = [...orders].sort((a, b) => b.date - a.date).slice(0, 5)

  const StatSkeleton = () => (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-28" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              color="blue"
              label="Total Products"
              value={products.length.toLocaleString()}
              sub="in catalogue"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>}
            />
            <StatCard
              color="green"
              label="Total Orders"
              value={orders.length.toLocaleString()}
              sub="all time"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" /></svg>}
            />
            <StatCard
              color="purple"
              label="Revenue"
              value={`${currency}${totalRevenue.toLocaleString()}`}
              sub="from paid orders"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.33.576Z" /><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-6a.75.75 0 0 1 .75.75v.316a3.78 3.78 0 0 1 1.653.713c.426.33.744.74.925 1.2a.75.75 0 0 1-1.395.55 1.35 1.35 0 0 0-.447-.563 2.187 2.187 0 0 0-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 0 1-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 1 1 1.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 0 1-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 0 1 1.653-.713V4.75A.75.75 0 0 1 10 4Z" clipRule="evenodd" /></svg>}
            />
            <StatCard
              color="amber"
              label="Pending Orders"
              value={pendingOrders.toLocaleString()}
              sub="awaiting fulfillment"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" /></svg>}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Orders — Last 7 Days</h3>
          {loading ? (
            <Skeleton className="h-48 w-full rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="orders" stroke="#C586A5" strokeWidth={2.5} dot={{ fill: '#C586A5', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Status</h3>
          {loading ? (
            <Skeleton className="h-48 w-full rounded" />
          ) : pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#CBD5E1'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-gray-700">Recent Orders</h3>
        </div>
        {loading ? (
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <Skeleton className="w-10 h-10 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="divide-y">
            {recentOrders.map(order => (
              <div key={order._id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {new Date(order.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{currency}{order.amount.toLocaleString()}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${order.payment ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {order.payment ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
