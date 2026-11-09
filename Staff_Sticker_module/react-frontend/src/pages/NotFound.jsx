import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-[120px] font-bold text-emerald-600 leading-none">404</div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-12 bg-emerald-600 rounded"></div>
            <Search className="w-6 h-6 text-emerald-600" />
            <div className="h-1 w-12 bg-emerald-600 rounded"></div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-[28px] font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
          Sorry, the page you're looking for doesn't exist or has been moved. 
          Please check the URL or return to the Sticker Management dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-semibold hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-[12px] text-gray-400">
            Sticker Management System - MinSU Business Center
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
