import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/Slice";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaShoppingCart,
} from "react-icons/fa";
import cakeVideo from "../../assets/Gallery/cake.mp4";

export default function FilterPage() {
  const [active, setActive] = useState("All"); // Changed default to "All"
  const [maxPrice, setMaxPrice] = useState(1500);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [flavours, setflavours] = useState([]);
  const [weights, setWeights] = useState([]);
  const [activeflavour, setActiveflavour] = useState("All");
  const [activeWeight, setActiveWeight] = useState("All");
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // New state for UI enhancements
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1500]);

  // Auto-slide interval ref for featured section
  const slideIntervalRef = useRef(null);


// Replace your fixImageUrl function with this:
const fixImageUrl = (url) => {
  console.log(`🔧 Fixing URL: "${url}"`);
  
  if (!url || url === 'undefined' || url === 'null' || url.trim() === '') {
    console.log(`❌ URL is invalid, using fallback`);
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop';
  }
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log(`✅ Already full URL: ${url}`);
    return url;
  }
  
  // For local paths, try localhost:5000
  if (url.startsWith('/uploads/')) {
    const fullUrl = `http://localhost:5000${url}`;
    console.log(`🔄 Converted local path to: ${fullUrl}`);
    return fullUrl;
  }
  
  // For Cloudinary path format (starts with v)
  if (url.startsWith('v')) {
    // This might be a Cloudinary public ID
    const cloudinaryUrl = `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${url}`;
    console.log(`☁️ Converted to Cloudinary URL: ${cloudinaryUrl}`);
    return cloudinaryUrl;
  }
  
  // For filenames without path
  if (!url.includes('/') && url.includes('.')) {
    const localUrl = `http://localhost:5000/uploads/products/${url}`;
    console.log(`📁 Converted filename to: ${localUrl}`);
    return localUrl;
  }
  
  console.log(`⚠️ Could not fix URL, using fallback`);
  return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop';
};

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const urlCategory = searchParams.get("category");

        const response = await axios.get("http://localhost:5000/api/product", { 
          params: { limit: 100 } 
        });

        console.log("📦 API Response:", response.data);

        if (response.data && response.data.success) {
          // In FilterPage component, update the product mapping:
const formattedProducts = response.data.products.map(product => {
  console.log(`\n🛒 Processing product: ${product.name}`);
  console.log(`🆔 Product ID: ${product._id}`);
  console.log(`🖼️ Raw images array:`, product.images);
  
  // Get the first image from the images array
  let imageUrl = "/cake5.jpg";
  
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const rawImageUrl = product.images[0];
    console.log(`📷 First image URL: "${rawImageUrl}"`);
    
    // Fix the URL
    if (typeof rawImageUrl === 'string') {
      // If it's already a full URL
      if (rawImageUrl.startsWith('http')) {
        imageUrl = rawImageUrl;
      } 
      // If it's a local path
      else if (rawImageUrl.startsWith('/uploads/')) {
        imageUrl = `http://localhost:5000${rawImageUrl}`;
      }
      // If it's just a filename
      else if (rawImageUrl.includes('.')) {
        imageUrl = `http://localhost:5000/uploads/products/${rawImageUrl}`;
      }
    }
    
    console.log(`✅ Final URL: ${imageUrl}`);
  } else {
    console.warn(`⚠️ No valid images for product: ${product.name}`);
    console.log(`   Images data:`, product.images);
  }
  
  return {
    id: product._id || product.id,
    name: product.name,
    price: product.price,
    img: imageUrl,
    category: product.category || "Classic Cakes",
    description: product.description || "Delicious bakery item",
    stock: product.stock || 10,
    flavour: product.flavour || "Classic",
    weight: product.weight || "1kg",
    // Keep raw images for debugging
    _rawImages: product.images || []
  };
});

          setProducts(formattedProducts);

          // Extract unique values - ADD "All" OPTION
          const uniqueCategories = ["All", ...new Set(formattedProducts.map(p => p.category))];
          const uniqueflavours = ["All", ...new Set(formattedProducts.map(p => p.flavour))];
          const uniqueWeights = ["All", ...new Set(formattedProducts.map(p => p.weight))];

          setCategories(uniqueCategories);
          setflavours(uniqueflavours);
          setWeights(uniqueWeights);

          if (urlCategory && uniqueCategories.includes(urlCategory)) {
            setActive(urlCategory);
          } else if (!uniqueCategories.includes(active) && uniqueCategories.length > 0) {
            setActive(uniqueCategories[0]); // This will be "All" now
          }

          toast.success(`Loaded ${formattedProducts.length} products!`);
        } else {
          toast.error("Failed to load products: Invalid response format");
        }
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        toast.error("Failed to load products. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Add to cart
  const handleAddToCart = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      setTimeout(() => window.location.href = "/login", 1500);
      return;
    }
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.img,
      qty: 1
    }));
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  
  // Handle product click for modal
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Handle buy now
  const handleBuyNow = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to buy items");
      setTimeout(() => window.location.href = "/login", 1500);
      return;
    }
    if (product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.img,
      qty: 1
    }));
    window.location.href = "/order";
  };

  // Reset filters
  const resetFilters = () => {
    setActive("All"); // Reset to "All"
    setMaxPrice(1500);
    setActiveflavour("All");
    setActiveWeight("All");
    setSearchQuery("");
    setPriceRange([0, 1500]);
  };

  // Filtered products - UPDATED TO INCLUDE "All" CATEGORY
  const filteredData = products.filter(item =>
    (active === "All" || item.category === active) && // Changed this line
    item.price <= maxPrice &&
    (activeflavour === "All" || item.flavour === activeflavour) &&
    (activeWeight === "All" || item.weight === activeWeight) &&
    (searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter products by search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle price range change
  const handlePriceRangeChange = (newRange) => {
    const [min, max] = newRange;
    const validMin = Math.min(min, max);
    const validMax = Math.max(min, max);
    const finalRange = [validMin, validMax];
    setPriceRange(finalRange);
    setMaxPrice(finalRange[1]);
  };

  // Group products by category for display
  const getGroupedProducts = () => {
    if (active === "All") {
      // Group all products by their category
      const grouped = filteredData.reduce((acc, product) => {
        const category = product.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {});
      return grouped;
    } else {
      // For specific category, just show that category
      return { [active]: filteredData };
    }
  };

  const groupedProducts = getGroupedProducts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8b5e3c] mx-auto mb-4"></div>
          <p className="text-xl text-[#8b5e3c]">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f4]">
      {/* HERO SECTION - NEW DESIGN */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={cakeVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>

        <div className="relative z-10 h-full flex items-center mt-6">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl text-left"
              >
                Freshly Baked
                <span className="block text-[#f3d2ae] mt-2">Delights</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg sm:text-xl md:text-2xl text-white/95 mb-4 drop-shadow-lg text-left font-medium"
              >
                Crafted With Love & Passion
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-base sm:text-lg text-white/85 mb-8 drop-shadow-md text-left leading-relaxed"
              >
                2025 • Premium Bakery • Made Fresh Daily
              </motion.p>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-left"
              >
                <button
                  onClick={() => window.location.href = "/order"}
                  className="px-8 py-4 bg-gradient-to-r from-[#dda56a] to-[#e8b381] text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all"
                >
                  Order Now
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="w-full px-4 py-4 h-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* FILTER SIDEBAR - NEW DESIGN */}
          {/* Mobile Overlay */}
          {showFilters && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowFilters(false)}
            />
          )}

          <aside
            className={`lg:w-80 flex-shrink-0 ${showFilters
                ? "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-80 lg:w-auto"
                : "hidden lg:block"
              }`}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 h-full lg:max-h-[90vh] lg:sticky lg:top-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-[#8b5e3c] flex items-center gap-2">
                  <FaFilter className="text-[#8b5e3c]" /> Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close filters"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Search */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Search
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dda56a] focus:border-[#dda56a] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Price Range Slider - Dual Range */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                </label>
                <div className="relative h-8">
                  {/* Track Background */}
                  <div className="absolute w-full h-2 bg-gray-200 rounded-lg top-1/2 -translate-y-1/2"></div>

                  {/* Active Range */}
                  <div
                    className="absolute h-2 bg-[#8b5e3c] rounded-lg top-1/2 -translate-y-1/2 transition-all duration-300 ease-out "
                    style={{
                      left: `${(priceRange[0] / 1500) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / 1500) * 100}%`,
                    }}
                  ></div>

                  {/* Min Range Input */}
                  <input
                    type="range"
                    min="0"
                    max={1500}
                    step={50}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = Math.min(Number(e.target.value), priceRange[1]);
                      handlePriceRangeChange([newMin, priceRange[1]]);
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                  />

                  {/* Max Range Input */}
                  <input
                    type="range"
                    min="0"
                    max={1500}
                    step={50}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = Math.max(Number(e.target.value), priceRange[0]);
                      handlePriceRangeChange([priceRange[0], newMax]);
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
                  />

                  {/* Min/Max Labels */}
                  <div className="flex justify-between text-xs text-gray-500 pt-4 ">
                    <span className="font-medium mt-2">₹0</span>
                    <span className="font-medium mt-2">₹1500</span>
                  </div>
                </div>
              </div>

              {/* Categories - UPDATED WITH "All" OPTION */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2.5">Categories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActive(cat)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${active === cat
                          ? "bg-[#8b5e3c] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavours - OLD LOGIC WITH NEW DESIGN */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Flavour
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveflavour("All")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeflavour === "All"
                        ? "bg-[#8b5e3c] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                      }`}
                  >
                    All
                  </button>
                  {flavours.filter(f => f !== "All").map(flavour => (
                    <button
                      key={flavour}
                      onClick={() => setActiveflavour(flavour)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeflavour === flavour
                          ? "bg-[#8b5e3c] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }`}
                    >
                      {flavour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weights - OLD LOGIC WITH NEW DESIGN */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Weight (KG)
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveWeight("All")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeWeight === "All"
                        ? "bg-[#8b5e3c] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                      }`}
                  >
                    All
                  </button>
                  {weights.filter(w => w !== "All").map(weight => (
                    <button
                      key={weight}
                      onClick={() => setActiveWeight(weight)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeWeight === weight
                          ? "bg-[#8b5e3c] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-2.5 px-4 bg-[#8b5e3c] hover:bg-[#6f472b] text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all font-medium border border-gray-200 hover:border-gray-300"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN PRODUCT AREA */}
          <div className="flex-1">
            {/* Sort and Filter Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md text-[#8b5e3c] font-medium hover:bg-gray-50"
              >
                <FaFilter /> {showFilters ? "Hide" : "Show"} Filters
              </button>

              {/* Info bar - UPDATED DESIGN */}
              <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-3 flex-1">
                <div className="flex gap-4 items-center flex-wrap">
                  <span className="font-bold text-[#8b5e3c] px-3 py-1 bg-[#e2bf9d] rounded-full text-sm">
                    {active === "All" ? "All Categories" : active}
                  </span>
                  <span className="font-bold text-[#8b5e3c] text-sm">Up to ₹ {maxPrice}</span>
                  {activeflavour !== "All" && <span className="font-bold text-[#8b5e3c] text-sm">{activeflavour}</span>}
                  {activeWeight !== "All" && <span className="font-bold text-[#8b5e3c] text-sm">{activeWeight}</span>}
                </div>
                <p className="text-gray-700 text-sm">
                  Showing <span className="font-bold text-[#8b5e3c]">{filteredData.length}</span> of {products.length} products
                </p>
              </div>
            </div>

            {/* PRODUCT GRID - UPDATED FOR "All" CATEGORY */}
            {filteredData.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <p className="text-xl text-gray-600 mb-4">No products found</p>
                <p className="text-gray-500">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#6f472b] transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Display grouped products */}
                {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                  <motion.section
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6 md:p-8"
                  >
                    {active === "All" && (
                      <h2 className="text-2xl md:text-3xl font-bold text-[#8b5e3c] mb-6 pb-3 border-b-2 border-[#e2bf9d]">
                        {category}
                      </h2>
                    )}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${active !== "All" ? "mt-0" : ""}`}>
                      {categoryProducts.map(item => (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -5 }}
                          onClick={() => handleProductClick(item)}
                          className="bg-gradient-to-br from-[#fff9f4] to-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-transparent hover:border-[#c89f7a]/60 flex flex-col cursor-pointer"
                        >
                          <div className="flex-shrink-0">
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#f0e3d6] to-[#fff9f4]">
<img 
                                    src={item.img } 
                                    alt={item.name} 
                                    className="h-full w-full rounded object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/Image/default.avif";
                                    }}
                                  />
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
                                <span className="text-sm font-bold text-[#8b5e3c]">₹ {item.price}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg font-bold text-[#8b5e3c] mb-2 line-clamp-2 hover:text-[#6f472b] transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex gap-2 mb-3 flex-wrap">
                              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{item.flavour}</span>
                              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{item.weight}</span>
                              {active === "All" && (
                                <span className="text-xs font-medium px-2 py-1 bg-[#e2bf9d] text-[#8b5e3c] rounded-full">{item.category}</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 mt-auto pt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(item);
                                }}
                                disabled={item.stock === 0}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all ${item.stock === 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-[#8b5e3c] text-white hover:bg-[#6f472b]"
                                  }`}
                              >
                                <FaShoppingCart className="text-sm" />
                                {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                              </button>
                              {item.stock > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBuyNow(item);
                                  }}
                                  className="w-full px-4 py-2.5 bg-gradient-to-r from-[#dda56a] to-[#e8b381] text-white rounded-lg hover:from-[#c8955a] hover:to-[#d8a371] transition-all font-medium text-sm shadow-md hover:shadow-lg"
                                >
                                  Buy Now
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal - NEW DESIGN */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <motion.div
            key="product-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowProductModal(false);
              setSelectedProduct(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden bg-gradient-to-br from-[#fff9f4] to-[#f0e3d6]">
                  <img
                    src={selectedProduct.img}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x400?text=No+Image";
                    }}
                  />
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      setSelectedProduct(null);
                    }}
                    className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all"
                    aria-label="Close modal"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 flex flex-col">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#8b5e3c] mb-3">
                    {selectedProduct.name}
                  </h2>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl md:text-4xl font-bold text-[#8b5e3c]">
                      ₹{selectedProduct.price}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
                    <span className="inline-block px-3 py-1 bg-[#e2bf9d] text-[#8b5e3c] rounded-full text-sm font-medium">
                      {selectedProduct.category || "Uncategorized"}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedProduct.description || "Delicious bakery item made with love and premium ingredients."}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Details</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        Flavour: {selectedProduct.flavour}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        Weight: {selectedProduct.weight}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        Stock: {selectedProduct.stock} units
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 space-y-3">
                    {selectedProduct.stock <= 0 ? (
                      <p className="text-red-500 text-center py-3 bg-red-50 rounded-lg font-medium">
                        Out of Stock
                      </p>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            handleAddToCart(selectedProduct);
                            setShowProductModal(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#6f472b] transition-colors font-semibold text-base shadow-lg hover:shadow-xl"
                        >
                          <FaShoppingCart />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => {
                            handleBuyNow(selectedProduct);
                            setShowProductModal(false);
                          }}
                          className="w-full px-6 py-3 bg-gradient-to-r from-[#dda56a] to-[#e8b381] text-white rounded-lg hover:from-[#c8955a] hover:to-[#d8a371] transition-all font-semibold text-base shadow-lg hover:shadow-xl"
                        >
                          Buy Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}