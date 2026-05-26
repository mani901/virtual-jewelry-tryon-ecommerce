import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem, { ProductItemSkeleton } from './ProductItem'

const LatestCollection = () => {
  const { products } = useContext(ShopContext)
  const [latestProducts, setLatestProducts] = useState([])

  useEffect(() => {
    setLatestProducts(products.slice(0, 10))
  }, [products])

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1="LATEST" text2="COLLECTIONS" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-jewelry-stone mt-2">
          Explore our newest jewellery arrivals — from golden necklaces to gemstone rings — each piece a testament to artisanal excellence.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
        {latestProducts.length === 0
          ? Array.from({ length: 10 }).map((_, i) => <ProductItemSkeleton key={i} />)
          : latestProducts.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
              bestseller={item.bestseller}
              isNew
            />
          ))
        }
      </div>
    </div>
  )
}

export default LatestCollection
