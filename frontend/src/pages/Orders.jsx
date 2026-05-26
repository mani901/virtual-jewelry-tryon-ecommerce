import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'
import EmptyState from '../components/ui/EmptyState'
import { OrderCardSkeleton } from '../components/ui/Skeleton'

const statusColors = {
  'Delivered': 'bg-emerald-100 text-emerald-700',
  'Shipped': 'bg-blue-100 text-blue-700',
  'Packing': 'bg-amber-100 text-amber-700',
  'Order Placed': 'bg-gray-100 text-gray-600',
  'Out of delivery': 'bg-orange-100 text-orange-700',
}

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext)
  const [orderData, setOrderData] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrderData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        const allOrdersItem = []
        response.data.orders.forEach(order => {
          order.items.forEach(item => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            })
          })
        })
        setOrderData(allOrdersItem.reverse())
      }
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrderData() }, [token])

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-8">
        <Title text1="MY" text2="ORDERS" />
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : orderData.length === 0 ? (
        <EmptyState
          icon="package"
          title="No orders yet"
          subtitle="Your order history will appear here once you make a purchase"
          cta={{ label: 'Start Shopping', href: '/collection' }}
        />
      ) : (
        <div className="space-y-0 divide-y divide-gray-100">
          {orderData.map((item, index) => (
            <div key={index} className="py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-5 text-sm">
                <img className="w-16 sm:w-20 aspect-square object-cover rounded-sm bg-jewelry-blush flex-shrink-0" src={item.image[0]} alt={item.name} />
                <div>
                  <p className="font-medium text-jewelry-charcoal sm:text-base line-clamp-2">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-jewelry-stone">
                    <p className="font-medium text-jewelry-charcoal">{currency}{item.price.toLocaleString()}</p>
                    <span>·</span>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <p className="mt-1 text-xs text-jewelry-stone">
                    {new Date(item.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="mt-0.5 text-xs text-jewelry-stone">
                    via {item.paymentMethod}
                    {item.payment && <span className="ml-2 text-emerald-600 font-medium">· Paid</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 md:w-auto">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {item.status}
                </span>
                <button
                  onClick={() => toast.info('Order tracking coming soon')}
                  className="px-4 py-2 text-xs font-medium border border-gray-200 hover:border-jewelry-charcoal hover:text-jewelry-charcoal transition-colors"
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
