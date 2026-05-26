const Skeleton = ({ className = '' }) => (
  <div
    className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
    aria-hidden="true"
  />
)

export const ProductCardSkeleton = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="aspect-[3/4] w-full rounded-sm" />
    <Skeleton className="h-4 w-3/4 mt-1" />
    <Skeleton className="h-4 w-1/3" />
  </div>
)

export const OrderCardSkeleton = () => (
  <div className="border rounded-md p-4 flex gap-4 animate-fade-in">
    <Skeleton className="w-16 h-16 rounded shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
)

export default Skeleton
