import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import RelatedProducts from '../components/RelatedProducts'
import QuantitySelector from '../components/ui/QuantitySelector'
import Skeleton from '../components/ui/Skeleton'
import Breadcrumb from '../components/ui/Breadcrumb'
import VirtualTryOn from '../components/VirtualTryOn'

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
  const { products, currency, addToCart } = useContext(ShopContext)
  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showTryOn, setShowTryOn] = useState(false)

  useEffect(() => {
    const found = products.find(item => item._id === productId)
    if (found) {
      setProductData(found)
      setImage(found.image[0])
    }
  }, [productId, products])

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
              {tab === 'reviews' ? `Reviews (${productData.reviews?.length ?? 0})` : 'Description'}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-jewelry-stone leading-relaxed">
          {activeTab === 'description' && <p className="md:w-4/5">{productData.description}</p>}
          {activeTab === 'reviews' && (
            productData.reviews?.length > 0
              ? productData.reviews.map((review, i) => (
                <div key={i} className="border-b border-gray-100 py-4">
                  <p className="font-medium text-jewelry-charcoal">{review.name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-jewelry-gold"><path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 11.92l-3.135 1.074a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" /></svg>
                    ))}
                  </div>
                  <p className="mt-2">{review.text}</p>
                </div>
              ))
              : (
                <div className="py-10 text-center">
                  <p className="text-jewelry-stone-light mb-1">No reviews yet</p>
                  <p className="text-xs text-gray-300">Be the first to review this piece</p>
                </div>
              )
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
