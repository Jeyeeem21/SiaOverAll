import React from 'react';

// Skeleton shimmer animation
const shimmer = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

// Card Grid Loading Skeleton - for products/orders
export const CardGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="space-y-3 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className={`h-5 bg-gray-200 rounded w-3/4 ${shimmer}`}></div>
                <div className={`h-4 bg-gray-200 rounded w-1/2 ${shimmer}`}></div>
              </div>
              <div className={`h-6 w-20 bg-gray-200 rounded-full ${shimmer}`}></div>
            </div>
            <div className={`h-4 bg-gray-200 rounded w-full ${shimmer}`}></div>
            <div className={`h-4 bg-gray-200 rounded w-2/3 ${shimmer}`}></div>
            <div className="flex items-center justify-between pt-2">
              <div className={`h-6 bg-gray-200 rounded w-24 ${shimmer}`}></div>
              <div className={`h-4 bg-gray-200 rounded w-20 ${shimmer}`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Product Card Loading Skeleton
export const ProductCardSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="space-y-4 animate-pulse">
            <div className={`h-48 bg-gray-200 ${shimmer}`}></div>
            <div className="p-5 space-y-3">
              <div className={`h-3 bg-gray-200 rounded w-16 ${shimmer}`}></div>
              <div className={`h-5 bg-gray-200 rounded w-full ${shimmer}`}></div>
              <div className={`h-4 bg-gray-200 rounded w-3/4 ${shimmer}`}></div>
              <div className={`h-12 bg-gray-200 rounded-lg ${shimmer}`}></div>
              <div className="flex gap-2">
                <div className={`h-10 bg-gray-200 rounded-lg flex-1 ${shimmer}`}></div>
                <div className={`h-10 bg-gray-200 rounded-lg flex-1 ${shimmer}`}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Stats Card Loading Skeleton
export const StatsCardSkeleton = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2 animate-pulse">
              <div className={`h-3 bg-gray-200 rounded w-20 ${shimmer}`}></div>
              <div className={`h-7 bg-gray-200 rounded w-24 ${shimmer}`}></div>
              <div className={`h-3 bg-gray-200 rounded w-16 ${shimmer}`}></div>
            </div>
            <div className={`w-12 h-12 bg-gray-200 rounded-xl ${shimmer}`}></div>
          </div>
        </div>
      ))}
    </>
  );
};

// Form Loading Skeleton
export const FormSkeleton = ({ fields = 5 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className={`h-3 bg-gray-200 rounded w-24 ${shimmer}`}></div>
          <div className={`h-10 bg-gray-200 rounded-lg ${shimmer}`}></div>
        </div>
      ))}
      <div className="flex gap-2.5 pt-4">
        <div className={`h-10 bg-gray-200 rounded-xl flex-1 ${shimmer}`}></div>
        <div className={`h-10 bg-gray-200 rounded-xl flex-1 ${shimmer}`}></div>
      </div>
    </div>
  );
};

// Inline Loading Spinner (for buttons, small areas)
export const InlineLoader = ({ size = 'md', color = 'emerald' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const colorClasses = {
    emerald: 'border-emerald-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

// Full Page Loading Overlay
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-gray-900 font-bold text-[15px]">{message}</p>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        {Icon && <Icon className="w-12 h-12 text-gray-400" />}
      </div>
      <h3 className="text-[13px] font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Compact Loading Bar (for top of page)
export const LoadingBar = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 animate-[loading_1.5s_ease-in-out_infinite]"></div>
    </div>
  );
};

export default {
  CardGridSkeleton,
  ProductCardSkeleton,
  StatsCardSkeleton,
  FormSkeleton,
  InlineLoader,
  PageLoader,
  EmptyState,
  LoadingBar,
};
