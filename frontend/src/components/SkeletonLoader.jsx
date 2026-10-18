// Reusable Skeleton Loading Components

export const SkeletonBox = ({ className = "", width, height }) => (
  <div 
    className={`bg-gray-200 animate-pulse rounded ${className}`}
    style={{ width, height }}
  />
);

export const SkeletonText = ({ lines = 1, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="space-y-1">
        <div className="h-4 bg-gray-200 animate-pulse rounded" style={{ width: `${Math.random() * 40 + 60}%` }} />
        {i < lines - 1 && <div className="h-3 bg-gray-200 animate-pulse rounded" style={{ width: `${Math.random() * 30 + 40}%` }} />}
      </div>
    ))}
  </div>
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

export const SkeletonProductCard = ({ className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        {/* Price skeleton */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        
        {/* Category skeleton */}
        <div className="flex justify-center mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-1/2"></div>
        </div>
        
        {/* Buttons skeleton */}
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonOrderCard = ({ className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
    <div className="animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  </div>
);

export const SkeletonProfileSection = ({ className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    <div className="animate-pulse">
      <div className="p-6 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonDashboardCard = ({ className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
          ))}
        </div>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 30 + 60}%` }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Page-specific skeleton layouts
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
    <div className="pt-6 sm:pt-8">
      <div className="container-responsive space-responsive">
        {/* Header skeleton */}
        <div className="text-center mb-8 animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
        
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonDashboardCard key={i} />
          ))}
        </div>
        
        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  </div>
);

export const ProductsSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
    <div className="pt-6 sm:pt-8">
      <div className="container-responsive space-responsive">
        {/* Header skeleton */}
        <div className="text-center mb-8 animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
        
        {/* Search and filters skeleton */}
        <SkeletonCard className="mb-6" />
        <SkeletonCard className="mb-6" />
        
        {/* Products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const OrdersSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
    <div className="pt-6 sm:pt-8">
      <div className="container-responsive space-responsive">
        {/* Header skeleton */}
        <div className="text-center mb-8 animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
        
        {/* Orders list skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonOrderCard key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
    <div className="pt-6 sm:pt-8">
      <div className="container-responsive space-responsive">
        {/* Profile header skeleton */}
        <div className="text-center mb-8 animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-3"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
        </div>
        
        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
        
        {/* Profile sections skeleton */}
        <div className="space-y-6">
          <SkeletonProfileSection />
          <SkeletonProfileSection />
          <SkeletonProfileSection />
        </div>
      </div>
    </div>
  </div>
);