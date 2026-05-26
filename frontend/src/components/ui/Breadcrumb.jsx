import { Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { ShopContext } from '../../context/ShopContext'

const routeLabels = {
  '': 'Home',
  collection: 'Collection',
  about: 'About',
  contact: 'Contact',
  cart: 'Cart',
  login: 'Login',
  'place-order': 'Checkout',
  orders: 'Orders',
  verify: 'Verify',
}

const Breadcrumb = () => {
  const { pathname } = useLocation()
  const { products } = useContext(ShopContext)
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = [{ label: 'Home', path: '/' }]

  segments.forEach((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/')
    let label = routeLabels[seg]

    if (!label) {
      const product = products.find(p => p._id === seg)
      label = product ? product.name : seg
    }

    crumbs.push({ label, path })
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-jewelry-stone py-3">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-300">/</span>}
          {i < crumbs.length - 1
            ? <Link to={crumb.path} className="hover:text-jewelry-charcoal transition-colors">{crumb.label}</Link>
            : <span className="text-jewelry-charcoal font-medium truncate max-w-[160px]">{crumb.label}</span>
          }
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumb
