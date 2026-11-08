const LoadingBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <LoadingBlock className="mx-auto h-10 w-1/3" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((item) => <LoadingBlock key={item} className="h-28" />)}
    </div>
    <LoadingBlock className="h-48" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-4">
    <LoadingBlock className="h-10 w-1/3" />
    <LoadingBlock className="h-64" />
  </div>
);

export const OrdersSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((item) => <LoadingBlock key={item} className="h-24" />)}
  </div>
);

export const ProductsSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((item) => <LoadingBlock key={item} className="h-72" />)}
  </div>
);
