import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Package, Search, ShoppingCart, ArrowLeft, Filter } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import usePageTitle from '../hooks/usePageTitle';

const PublicProducts = () => {
  usePageTitle('Products');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Update selected category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Get active products only
  const activeProducts = products.filter(p => p.is_active && p.status === 'active');

  // Filter products
  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Get current category name
  const currentCategory = categories.find(cat => cat.category_id === parseInt(selectedCategory));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {currentCategory ? currentCategory.category_name : 'All Products'}
                </h1>
                <p className="text-[11px] text-gray-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-colors"
            >
              Sign In to Order
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer appearance-none bg-white min-w-[200px]"
              >
                <option value="all">All Categories</option>
                {categories
                  .filter(cat => cat.status === 'active')
                  .map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {productsLoading || categoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-[13px] text-gray-500 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "No products available in this category"}
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-colors"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          // Products Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-emerald-50 to-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-emerald-600 opacity-50" />
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {product.product_name}
                    </h3>
                    {product.category?.category_name && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {product.category.category_name}
                      </p>
                    )}
                  </div>

                  {/* Price and Stock */}
                  <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[18px] font-bold text-gray-900">
                        ₱{parseFloat(product.price).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        per {product.unit || 'piece'}
                      </p>
                    </div>
                    <div className="text-right">
                      {(product.inventory?.quantity || 0) > 0 ? (
                        <p className="text-[11px] font-semibold text-emerald-600">
                          In Stock
                        </p>
                      ) : (
                        <p className="text-[11px] font-semibold text-rose-600">
                          Out of Stock
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description (if available) */}
                  {product.description && (
                    <p className="text-[11px] text-gray-600 line-clamp-2 pt-2">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h3 className="text-[20px] font-bold text-gray-900 mb-2">Ready to Place an Order?</h3>
          <p className="text-[13px] text-gray-600 mb-5">
            Sign in to your account or register to start ordering
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProducts;
