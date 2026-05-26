const Skeleton = ({ className = '' }) => (
  <div
    className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
    aria-hidden="true"
  />
)

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
)

export const OrderCardSkeleton = () => (
  <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 border-b py-4 px-2 items-center animate-fade-in">
    <Skeleton className="w-14 h-14 rounded" />
    <div className="flex flex-col gap-2">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-8 w-28 rounded" />
  </div>
)

export default Skeleton
