import { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Stars = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"
        fill={i <= value ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={i <= value ? 0 : 1.5}
        className={`w-3.5 h-3.5 ${i <= value ? 'text-amber-400' : 'text-gray-300'}`}>
        <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 11.92l-3.135 1.074a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
      </svg>
    ))}
  </div>
)

const Reviews = ({ token }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('All')

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await axios.get(backendUrl + '/api/review/all', { headers: { token } })
      if (res.data.success) {
        setProducts(res.data.products)
      } else {
        toast.error(res.data.message)
      }
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId, reviewId) => {
    setDeletingId(reviewId)
    try {
      const res = await axios.post(
        backendUrl + '/api/review/admin-delete',
        { productId, reviewId },
        { headers: { token } }
      )
      if (res.data.success) {
        toast.success('Review deleted')
        // Remove review from local state without a full refetch
        setProducts(prev => prev
          .map(p => p._id === productId
            ? { ...p, reviews: p.reviews.filter(r => r._id !== reviewId) }
            : p
          )
          .filter(p => p.reviews.length > 0)
        )
      } else {
        toast.error(res.data.message)
      }
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => { fetchReviews() }, [token])

  // Flatten all reviews for filtering / counting
  const allReviews = products.flatMap(p =>
    p.reviews.map(r => ({ ...r, productId: p._id, productName: p.name, productImage: p.image?.[0] }))
  )

  const filtered = allReviews.filter(r => {
    const matchSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.text.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase())
    const matchRating = ratingFilter === 'All' || r.rating === Number(ratingFilter)
    return matchSearch && matchRating
  })

  const totalReviews = allReviews.length
  const avgRating = totalReviews
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
    : '—'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Customer Reviews</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {totalReviews} total · avg {avgRating} ★
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="text-xs px-3 py-1.5 border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition-colors rounded"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by reviewer, product, or text…"
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-white/30 transition-colors"
        />
        <select
          value={ratingFilter}
          onChange={e => setRatingFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 outline-none focus:border-white/30 transition-colors"
        >
          <option value="All">All Ratings</option>
          {[5, 4, 3, 2, 1].map(n => (
            <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-white/10 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          <p className="font-medium">{search || ratingFilter !== 'All' ? 'No reviews match your filter' : 'No reviews yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <div key={review._id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-start gap-3">
                {/* Product image */}
                <img
                  src={review.productImage}
                  alt={review.productName}
                  className="w-12 h-12 object-cover rounded flex-shrink-0 bg-white/10"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400 truncate">{review.productName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-semibold text-slate-200">{review.name}</p>
                        <Stars value={review.rating} />
                        <span className="text-xs text-slate-500">
                          {new Date(review.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(review.productId, review._id)}
                      disabled={deletingId === review._id}
                      className="flex-shrink-0 text-xs px-2.5 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors rounded disabled:opacity-50"
                    >
                      {deletingId === review._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{review.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reviews
