import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, PackageOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { productService } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States initialized from URL params
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || 'featured';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : 0,
    max: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : 200000,
  });
  const [minRating, setMinRating] = useState(
    searchParams.get('rating') ? Number(searchParams.get('rating')) : 0
  );
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get('in_stock') === 'true'
  );

  // Fetch Categories & Brands once
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        if (catsRes.success) setCategories(catsRes.categories);
        if (brandsRes.success) setBrands(brandsRes.brands);
      } catch (err) {
        console.error('Metadata error:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Products whenever filters/page change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 12,
          q: searchQuery,
          category: selectedCategory,
          brand: selectedBrand,
          sort,
          rating: minRating || undefined,
          in_stock: inStockOnly || undefined,
        };
        if (priceRange.min > 0) params.min_price = priceRange.min;
        if (priceRange.max < 200000) params.max_price = priceRange.max;

        const res = await productService.getProducts(params);
        if (res.success) {
          setProducts(res.products);
          setTotalProducts(res.total);
          setTotalPages(res.total_pages);
        }
      } catch (err) {
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, selectedBrand, sort, page, priceRange, minRating, inStockOnly]);

  // Update query params helper
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter
    setSearchParams(newParams);
  };

  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
    const newParams = new URLSearchParams(searchParams);
    if (min > 0) newParams.set('min_price', min);
    else newParams.delete('min_price');
    if (max < 200000) newParams.set('max_price', max);
    else newParams.delete('max_price');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleRatingChange = (rating) => {
    setMinRating(rating);
    updateParam('rating', rating > 0 ? rating : '');
  };

  const handleInStockToggle = () => {
    const nextVal = !inStockOnly;
    setInStockOnly(nextVal);
    updateParam('in_stock', nextVal ? 'true' : '');
  };

  const handleResetFilters = () => {
    setPriceRange({ min: 0, max: 200000 });
    setMinRating(0);
    setInStockOnly(false);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Breadcrumb & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {selectedCategory ? `${selectedCategory.toUpperCase()}` : 'Explore All Products'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <span className="font-semibold text-slate-900">{totalProducts}</span> items {searchQuery && `matching "${searchQuery}"`}
          </p>
        </div>

        {/* Sort & Mobile Filter Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="featured">Featured & Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Highest Discount</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => updateParam('category', cat)}
              selectedBrand={selectedBrand}
              onSelectBrand={(b) => updateParam('brand', b)}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              minRating={minRating}
              onRatingChange={handleRatingChange}
              inStockOnly={inStockOnly}
              onInStockToggle={handleInStockToggle}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200">
                  <button
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => handlePageChange(pNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          page === pNum
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products matched your criteria</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, broadening your price range, or searching for a different keyword.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-base">Filter Products</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <FilterSidebar
              categories={categories}
              brands={brands}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                updateParam('category', cat);
                setMobileFilterOpen(false);
              }}
              selectedBrand={(b) => {
                updateParam('brand', b);
                setMobileFilterOpen(false);
              }}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              minRating={minRating}
              onRatingChange={handleRatingChange}
              inStockOnly={inStockOnly}
              onInStockToggle={handleInStockToggle}
              onReset={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
            />

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsPage;
