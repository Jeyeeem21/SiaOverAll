import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-[120px] font-bold text-emerald-600 leading-none">404</div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-12 bg-emerald-600 rounded"></div>
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="h-1 w-12 bg-emerald-600 rounded"></div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-[28px] font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
          Sorry, the page you're looking for doesn't exist or has been moved. 
          Please check the URL or return to the homepage.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-semibold hover:bg-gray-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-[12px] text-gray-400">
            Need help? Contact the MinSU Business Center support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
