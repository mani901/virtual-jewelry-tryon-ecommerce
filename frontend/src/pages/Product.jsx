import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import RelatedProducts from '../components/RelatedProducts'
import QuantitySelector from '../components/ui/QuantitySelector'
import Skeleton from '../components/ui/Skeleton'
import Breadcrumb from '../components/ui/Breadcrumb'
import VirtualTryOn from '../components/VirtualTryOn'

const getUserIdFromToken = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])).id } catch { return null }
}

const StarRating = ({ value, max = 5, size = 'sm' }) => {
  const dim = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
          fill={i < Math.round(value) ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={i < Math.round(value) ? 0 : 1.5}
          className={`${dim} ${i < Math.round(value) ? 'text-jewelry-gold' : 'text-gray-300'}`}>
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
        </svg>
      ))}
    </div>
  )
}

const StarInput = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button key={star} type="button" onClick={() => onChange(star)}
        className="transition-transform hover:scale-110"
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
          fill={star <= value ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={star <= value ? 0 : 1.5}
          className={`w-7 h-7 ${star <= value ? 'text-jewelry-gold' : 'text-gray-300 hover:text-jewelry-gold'}`}>
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
        </svg>
      </button>
    ))}
  </div>
)

const ProductSkeleton = () => (
  <div className="border-t-2 pt-10">
    <div className="flex gap-12 flex-col sm:flex-row">
      <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
        <div className="flex sm:flex-col gap-3 sm:w-[18.7%] w-full">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-[24%] sm:w-full aspect-square" />)}
        </div>
        <Skeleton className="flex-1 aspect-[4/5]" />
      </div>
      <div className="flex-1 space-y-4 pt-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-12 w-40 mt-6" />
      </div>
    </div>
  </div>
)

const Product = () => {
  const { productId } = useParams()
  const { products, currency, addToCart, addToWishlist, removeFromWishlist, isWishlisted, token, backendUrl } = useContext(ShopContext)
  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showTryOn, setShowTryOn] = useState(false)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const currentUserId = token ? getUserIdFromToken(token) : null

  const fetchFreshProduct = async () => {
    try {
      const res = await axios.post(backendUrl + '/api/product/single', { productId })
      if (res.data.success) setReviews(res.data.product.reviews || [])
    } catch { /* silent — reviews just stay as-is */ }
  }

  useEffect(() => {
    const found = products.find(item => item._id === productId)
    if (found) {
      setProductData(found)
      setImage(found.image[0])
      setReviews(found.reviews || [])
    }
  }, [productId, products])

  useEffect(() => {
    if (productId) fetchFreshProduct()
  }, [productId])

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const userReview = reviews.find(r => r.userId === currentUserId)

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!token) { toast.error('Please log in to leave a review'); return }
    if (reviewRating === 0) { toast.error('Please select a star rating'); return }
    if (!reviewText.trim()) { toast.error('Please write your review'); return }
    setSubmitting(true)
    try {
      const res = await axios.post(
        backendUrl + '/api/review/add',
        { productId, rating: reviewRating, text: reviewText },
        { headers: { token } }
      )
      if (res.data.success) {
        setReviews(res.data.reviews)
        setReviewRating(0)
        setReviewText('')
        toast.success('Review submitted!')
      } else {
        toast.error(res.data.message)
      }
    } catch { toast.error('Failed to submit review') }
    finally { setSubmitting(false) }
  }

  const handleDeleteReview = async (reviewId) => {
    setDeletingId(reviewId)
    try {
      const res = await axios.post(
        backendUrl + '/api/review/delete',
        { productId, reviewId },
        { headers: { token } }
      )
      if (res.data.success) {
        setReviews(res.data.reviews)
        toast.success('Review deleted')
      } else {
        toast.error(res.data.message)
      }
    } catch { toast.error('Failed to delete review') }
    finally { setDeletingId(null) }
  }

  const handleAddToCart = async () => {
    setAddingToCart(true)
    await addToCart(productData._id, quantity)
    toast.success(`${quantity > 1 ? `${quantity}× ` : ''}Added to cart!`)
    setAddingToCart(false)
  }

  if (products.length === 0) return <ProductSkeleton />
  if (!productData) return <ProductSkeleton />

  return (
    <div className="border-t pt-6 animate-fade-in">
      <Breadcrumb />

      <div className="flex gap-12 flex-col sm:flex-row mt-2">
        {/* Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full gap-2 sm:gap-0">
            {productData.image.map((item, index) => (
              <button
                key={index}
                onClick={() => setImage(item)}
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${image === item ? 'border-jewelry-charcoal' : 'border-transparent'}`}
                aria-label={`View image ${index + 1}`}
              >
                <img src={item} alt={`${productData.name} view ${index + 1}`} className="w-full aspect-square object-cover" />
              </button>
            ))}
          </div>
          <div className="w-full sm:w-[80%] overflow-hidden rounded-sm bg-jewelry-blush">
            <img
              key={image}
              className="w-full h-auto animate-fade-in object-cover"
              src={image}
              alt={productData.name}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="font-prata text-2xl text-jewelry-charcoal mt-2 leading-snug">{productData.name}</h1>

          <div className="flex items-center gap-2 mt-2 text-sm text-jewelry-stone">
            <span className="inline-block px-2 py-0.5 bg-jewelry-blush rounded-full text-xs">{productData.category}</span>
            <span>·</span>
            <span>{productData.subCategory}</span>
            {productData.bestseller && (
              <>
                <span>·</span>
                <span className="text-jewelry-gold font-medium">★ Bestseller</span>
              </>
            )}
          </div>

          <p className="mt-5 text-3xl font-medium text-jewelry-charcoal">{currency}{productData.price.toLocaleString()}</p>
          <p className="mt-4 text-jewelry-stone text-sm leading-relaxed md:w-4/5">{productData.description}</p>

          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button
              onClick={() => setShowTryOn(true)}
              className="border-2 border-jewelry-gold text-jewelry-gold px-6 py-3 text-sm hover:bg-jewelry-gold hover:text-white transition-colors duration-200 flex items-center gap-2"
              aria-label="Virtual try on"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 0 1 5.273 3h9.454a2.75 2.75 0 0 1 2.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3.73Zm3.068-5.852A1.25 1.25 0 0 1 5.273 4.5h9.454a1.25 1.25 0 0 1 1.205.918l1.523 5.52c.006.02.01.041.015.062H2.53l.014-.062 1.523-5.52ZM2.5 12.5v2.5h15v-2.5h-15Z" clipRule="evenodd" />
              </svg>
              Try On
            </button>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="bg-jewelry-charcoal text-white px-8 py-3 text-sm hover:bg-jewelry-gold transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
              aria-label="Add to cart"
            >
              {addingToCart ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding…
                </>
              ) : 'ADD TO CART'}
            </button>
            <button
              onClick={() => {
                if (isWishlisted(productData._id)) {
                  removeFromWishlist(productData._id)
                  toast.success('Removed from wishlist')
                } else {
                  addToWishlist(productData._id)
                  toast.success('Added to wishlist!')
                }
              }}
              className={`w-11 h-11 border flex items-center justify-center transition-colors duration-200 ${isWishlisted(productData._id) ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-500'}`}
              aria-label={isWishlisted(productData._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted(productData._id)
                ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-2.184C4.045 12.376 2 9.515 2 6.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 6.5c0 3.015-2.045 5.876-3.885 7.536a22.049 22.049 0 0 1-3.744 2.865l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" /></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              }
            </button>
          </div>

          <hr className="mt-8 sm:w-4/5 border-gray-100" />
          <div className="text-xs text-jewelry-stone mt-5 flex flex-col gap-1.5">
            <p className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-jewelry-gold"><path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1ZM5.05 3.05a.75.75 0 0 1 1.06 1.06L5.05 5.17a.75.75 0 1 1-1.06-1.06l1.06-1.06ZM12.95 3.05l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06ZM8 5.5A2.5 2.5 0 1 0 8 10.5 2.5 2.5 0 0 0 8 5.5ZM1 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 1 8Zm12.75-.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z" clipRule="evenodd" /></svg>
              100% authentic, hallmark-certified jewellery
            </p>
            <p className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-jewelry-gold"><path d="M8.75 2a.75.75 0 0 0-1.5 0V2.75h-3A1.25 1.25 0 0 0 3 4v8.75C3 13.44 3.56 14 4.25 14h7.5c.69 0 1.25-.56 1.25-1.25V4c0-.69-.56-1.25-1.25-1.25h-3V2Z" /></svg>
              Cash on delivery available nationwide
            </p>
            <p className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-jewelry-gold"><path fillRule="evenodd" d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2ZM6.22 5.22a.75.75 0 0 1 1.06 0L8 5.94l.72-.72a.75.75 0 0 1 1.06 1.06l-.72.72.72.72a.75.75 0 0 1-1.06 1.06L8 8.06l-.72.72a.75.75 0 0 1-1.06-1.06l.72-.72-.72-.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
              30-day return policy on all pieces
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-20">
        <div className="flex border-b border-gray-100">
          {['description', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-jewelry-charcoal text-jewelry-charcoal' : 'text-jewelry-stone hover:text-jewelry-charcoal'}`}
            >
              {tab === 'reviews' ? `Reviews (${reviews.length})` : 'Description'}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-jewelry-stone leading-relaxed">
          {activeTab === 'description' && <p className="md:w-4/5">{productData.description}</p>}

          {activeTab === 'reviews' && (
            <div className="space-y-8">

              {/* Average rating summary */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-jewelry-blush rounded-lg">
                  <div className="text-center">
                    <p className="text-4xl font-semibold text-jewelry-charcoal">{avgRating}</p>
                    <StarRating value={Number(avgRating)} size="lg" />
                    <p className="text-xs text-jewelry-stone mt-1">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length
                      const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-3 text-right text-jewelry-stone">{star}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-jewelry-gold flex-shrink-0"><path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 11.92l-3.135 1.074a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" /></svg>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-jewelry-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-jewelry-stone">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Write a review */}
              {!userReview && (
                <div className="border border-gray-100 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-jewelry-charcoal mb-4">Write a Review</h3>
                  {!token ? (
                    <p className="text-jewelry-stone text-sm">
                      Please <button onClick={() => window.location.href = '/login'} className="text-jewelry-charcoal underline hover:text-jewelry-gold transition-colors">log in</button> to leave a review.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <p className="text-xs text-jewelry-stone mb-2">Your rating <span className="text-red-400">*</span></p>
                        <StarInput value={reviewRating} onChange={setReviewRating} />
                      </div>
                      <div>
                        <p className="text-xs text-jewelry-stone mb-2">Your review <span className="text-red-400">*</span></p>
                        <textarea
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                          rows={4}
                          placeholder="Share your experience with this piece…"
                          className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-jewelry-charcoal placeholder-gray-300 outline-none focus:border-jewelry-charcoal transition-colors resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-jewelry-charcoal text-white px-6 py-2.5 text-xs font-medium hover:bg-jewelry-gold transition-colors duration-200 disabled:opacity-60 flex items-center gap-2"
                      >
                        {submitting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {submitting ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <div className="py-10 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-200 mx-auto mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                  <p className="text-jewelry-stone font-medium">No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to share your experience</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.map(review => {
                    const isOwn = review.userId === currentUserId
                    return (
                      <div key={review._id} className={`py-5 ${isOwn ? 'bg-jewelry-blush/40 -mx-1 px-1 rounded' : ''}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-jewelry-charcoal text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {review.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-jewelry-charcoal">{review.name}</p>
                                {isOwn && <span className="text-[10px] bg-jewelry-gold/20 text-jewelry-gold px-1.5 py-0.5 rounded font-medium">Your review</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <StarRating value={review.rating} />
                                <span className="text-[11px] text-gray-300">·</span>
                                <span className="text-[11px] text-gray-400">
                                  {new Date(review.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isOwn && (
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              disabled={deletingId === review._id}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
                              aria-label="Delete your review"
                            >
                              {deletingId === review._id ? 'Deleting…' : 'Delete'}
                            </button>
                          )}
                        </div>
                        <p className="mt-3 text-jewelry-stone leading-relaxed pl-11">{review.text}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

      <VirtualTryOn
        isOpen={showTryOn}
        onClose={() => setShowTryOn(false)}
        product={productData}
      />
    </div>
  )
}

export default Product
