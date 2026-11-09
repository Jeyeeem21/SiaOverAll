import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { Printer, CreditCard, ShoppingBag, FileText, Clock, CheckCircle, Package, Users, ArrowRight, TrendingUp, Box } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import axios from 'axios';

const Home = () => {
  usePageTitle('Home');
  const { data: allCategories = [], isLoading: categoriesLoading, error } = useCategories();
  const [topCategories, setTopCategories] = useState([]);
  const [stats, setStats] = useState({
    students_served: 0,
    services_offered: 0,
    total_orders: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch public stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_BASE_URL}/public-stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Get top 4 categories with most products
  useEffect(() => {
    if (allCategories && allCategories.length > 0) {
      // Sort categories by product count (descending) and take top 4
      const sorted = [...allCategories]
        .filter(cat => cat.products_count > 0) // Only categories with products
        .sort((a, b) => b.products_count - a.products_count)
        .slice(0, 4);
      setTopCategories(sorted);
    }
  }, [allCategories]);

  // Icon mapping for categories
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('print')) return Printer;
    if (name.includes('id')) return CreditCard;
    if (name.includes('fabric') || name.includes('uniform')) return ShoppingBag;
    if (name.includes('document') || name.includes('binding') || name.includes('lamination')) return FileText;
    return Box; // Default icon
  };

  // Color mapping for categories
  const getCategoryColor = (index) => {
    const colors = ['bg-emerald-500', 'bg-emerald-600', 'bg-rose-500', 'bg-amber-500'];
    return colors[index % colors.length];
  };

  const features = [
    { icon: Clock, text: 'Quick Processing' },
    { icon: CheckCircle, text: 'Quality Assured' },
    { icon: Package, text: 'Track Orders' },
    { icon: Users, text: 'Student-Friendly' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.06)_0%,_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[12px] font-semibold mb-6 border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Mindoro State University – Bongabong Campus
          </div>
          <h1 className="text-[40px] md:text-[52px] font-bold text-gray-900 tracking-tight leading-tight mb-5">
            MinSU Business Center
          </h1>
          <p className="text-[16px] text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Your one-stop solution for printing, ID creation, and uniform services.
            Fast, reliable, and affordable — all in one platform.
          </p>
          <div className="flex gap-3 justify-center mb-10">
            <Link to="/dashboard"
              className="group inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold text-[13px] hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-[0_4px_12px_rgba(5,150,105,0.25)]">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/services"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all">
              View Services
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full">
                <f.icon className="w-4 h-4 text-emerald-600" />
                <span className="text-[12px] font-semibold text-gray-700">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Our Services</h2>
          <p className="text-[14px] text-gray-500 mt-2">Comprehensive business solutions for the MinSU community</p>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-gray-200 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : topCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topCategories.map((category, i) => {
              const Icon = getCategoryIcon(category.category_name);
              const colorClass = getCategoryColor(i);
              return (
                <Link 
                  key={category.category_id} 
                  to={`/browse-products?category=${category.category_id}`}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`${colorClass} w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-[13px] font-bold text-gray-900 mb-1.5">{category.category_name}</h3>
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    {category.products_count} {category.products_count === 1 ? 'product' : 'products'} available
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[14px] text-gray-500">No categories available yet</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-emerald-600 py-14">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-[36px] font-bold tracking-tight mb-1">
                {statsLoading ? '...' : `${stats.students_served}+`}
              </div>
              <div className="text-[12px] text-emerald-100 font-medium uppercase tracking-wider">Students Served</div>
            </div>
            <div>
              <div className="text-[36px] font-bold tracking-tight mb-1">
                {statsLoading ? '...' : `${stats.services_offered}+`}
              </div>
              <div className="text-[12px] text-emerald-100 font-medium uppercase tracking-wider">Services Offered</div>
            </div>
            <div>
              <div className="text-[36px] font-bold tracking-tight mb-1">
                {statsLoading ? '...' : `${stats.total_orders}+`}
              </div>
              <div className="text-[12px] text-emerald-100 font-medium uppercase tracking-wider">Orders Completed</div>
            </div>
            <div>
              <div className="text-[36px] font-bold tracking-tight mb-1">24/7</div>
              <div className="text-[12px] text-emerald-100 font-medium uppercase tracking-wider">Order Tracking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <p className="text-[12px] text-gray-500">© {new Date().getFullYear()} Mindoro State University – Bongabong Campus | Business Center System</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
