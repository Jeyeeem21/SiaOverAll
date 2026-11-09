// Skeleton shimmer animation
const shimmer = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

const LoadingBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${shimmer} ${className}`} />
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <LoadingBlock className="mx-auto h-10 w-1/3" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="card">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <LoadingBlock className="h-3 w-20" />
              <LoadingBlock className="h-7 w-24" />
              <LoadingBlock className="h-3 w-16" />
            </div>
            <LoadingBlock className="w-12 h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
    <LoadingBlock className="h-48 rounded-2xl" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-4">
    <LoadingBlock className="h-10 w-1/3" />
    <div className="card">
      <div className="space-y-4">
        <LoadingBlock className="h-10 w-full" />
        <LoadingBlock className="h-10 w-full" />
        <LoadingBlock className="h-10 w-full" />
        <LoadingBlock className="h-24 w-full" />
      </div>
    </div>
  </div>
);

export const OrdersSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((item) => (
      <div key={item} className="card">
        <LoadingBlock className="h-24" />
      </div>
    ))}
  </div>
);

export const ProductsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
      <div key={item} className="card overflow-hidden">
        <div className="space-y-4">
          <LoadingBlock className="h-48 rounded-none" />
          <div className="p-5 space-y-3">
            <LoadingBlock className="h-3 w-16" />
            <LoadingBlock className="h-5 w-full" />
            <LoadingBlock className="h-4 w-3/4" />
            <LoadingBlock className="h-12 rounded-lg" />
            <div className="flex gap-2">
              <LoadingBlock className="h-10 rounded-lg flex-1" />
              <LoadingBlock className="h-10 rounded-lg flex-1" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

