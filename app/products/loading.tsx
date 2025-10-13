import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-6" />

      <Skeleton className="h-12 w-full mb-6" />

      <div className="lg:grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 hidden lg:block">
          <div className="space-y-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full" />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
