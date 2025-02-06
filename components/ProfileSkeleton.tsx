export default function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-8 animate-pulse">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                  <div className="space-y-3 mb-4">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Listings Skeleton */}
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
