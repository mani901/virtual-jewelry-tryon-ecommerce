import { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { TableRowSkeleton } from '../components/ui/Skeleton'
import Pagination from '../components/ui/Pagination'

const CATEGORIES = ['All', 'Earrings', 'Glasses', 'Nose Rings', 'Headpieces']
const PER_PAGE = 10

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [confirmId, setConfirmId] = useState(null)

  const fetchList = async () => {
    setLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success('Product removed')
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setConfirmId(null)
    }
  }

  useEffect(() => { fetchList() }, [])
  useEffect(() => { setPage(1) }, [search, categoryFilter])

  const filtered = list.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter
    return matchSearch && matchCat
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <>
      <ConfirmDialog
        open={!!confirmId}
        title="Delete Product?"
        message="This action cannot be undone. The product will be permanently removed."
        confirmLabel="Delete"
        onConfirm={() => removeProduct(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold text-gray-800">All Jewellery</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-48 outline-none focus:border-admin-accent"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-admin-accent text-gray-700"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Image</span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span className="text-center">Action</span>
        </div>

        {loading ? (
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="cube"
            title={list.length === 0 ? 'No products yet' : 'No products match your search'}
            subtitle={list.length === 0 ? 'Click "Add Jewellery" to list your first product' : 'Try a different search term or category'}
            cta={list.length === 0 ? { label: 'Add Jewellery', href: '/add' } : { label: 'Clear search', onClick: () => { setSearch(''); setCategoryFilter('All') } }}
          />
        ) : (
          <>
            {paginated.map((item) => (
              <div
                key={item._id}
                className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-3 py-3 px-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                <img className="w-12 h-12 object-cover rounded-md border border-gray-100" src={item.image[0]} alt={item.name} />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.name}</p>
                  {item.bestseller && (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Bestseller</span>
                  )}
                </div>
                <p className="text-gray-500">{item.category}</p>
                <p className="font-medium">{currency}{item.price.toLocaleString()}</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setConfirmId(item._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                    aria-label={`Delete ${item.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            <div className="px-4 py-3 border-t bg-gray-50">
              <Pagination current={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default List
