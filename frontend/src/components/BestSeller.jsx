import { useState, useEffect, useContext } from 'react'
import Title from './Title'
import ProductItem, { ProductItemSkeleton } from './ProductItem'
import { ShopContext } from '../context/ShopContext'

const BestSeller = () => {
  const { products } = useContext(ShopContext)
  const [bestSeller, setBestSeller] = useState([])

  useEffect(() => {
    const best = products.filter(item => item.bestseller)
    setBestSeller(best.slice(0, 5))
  }, [products])

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1="BEST" text2="SELLERS" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-jewelry-stone mt-2">
          Discover our most-loved jewellery pieces, treasured by women across Pakistan for their craftsmanship, beauty, and lasting quality.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
        {products.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <ProductItemSkeleton key={i} />)
          : bestSeller.map(item => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
              bestseller={item.bestseller}
            />
          ))
        }
      </div>
    </div>
  )
}

export default BestSeller
