import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/Slice";
import { useSearchParams } from "react-router-dom";
import cakeVideo from "../../assets/Gallery/cake.mp4";

export default function FilterPage() {
  const [active, setActive] = useState("Classic Cakes");
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

  // SIMPLIFIED Image URL fixer with fallbacks
  const fixImageUrl = (url) => {
    // If no URL, use fallback
    if (!url || url === 'undefined' || url === 'null' || url.trim() === '') {
      return '/cake5.jpg';
    }
    
    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it starts with /uploads/, prepend server URL
    if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    }
    
    // If it doesn't start with /, add it
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    
    // Default: prepend server URL
    return `http://localhost:5000${url}`;
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
          const formattedProducts = response.data.products.map(product => {
            console.log(`🛒 Processing product: ${product.name}`);
            console.log(`🖼️ Product images:`, product.images);
            
            // Get the first image or use fallback
            let imageUrl = "/cake5.jpg";
            
            if (product.images && product.images.length > 0 && product.images[0]) {
              const rawImageUrl = product.images[0];
              console.log(`📷 Raw image URL: ${rawImageUrl}`);
              
              // Try to fix the URL
              imageUrl = fixImageUrl(rawImageUrl);
              console.log(`✅ Final image URL for ${product.name}: ${imageUrl}`);
              
              // Test if image exists
              const img = new Image();
              img.onerror = () => {
                console.warn(`❌ Image failed to load: ${imageUrl}`);
                // Image will fall back to cake5.jpg via onError handler
              };
              img.src = imageUrl;
            } else {
              console.warn(`⚠️ No images for product: ${product.name}`);
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
              weight: product.weight || "1kg"
            };
          });

          setProducts(formattedProducts);

          // Extract unique values
          const uniqueCategories = [...new Set(formattedProducts.map(p => p.category))];
          const uniqueflavours = ["All", ...new Set(formattedProducts.map(p => p.flavour))];
          const uniqueWeights = ["All", ...new Set(formattedProducts.map(p => p.weight))];

          setCategories(uniqueCategories);
          setflavours(uniqueflavours);
          setWeights(uniqueWeights);

          if (urlCategory && uniqueCategories.includes(urlCategory)) {
            setActive(urlCategory);
          } else if (!uniqueCategories.includes(active) && uniqueCategories.length > 0) {
            setActive(uniqueCategories[0]);
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

  // Filtered products
  const filteredData = products.filter(item =>
    item.category === active &&
    item.price <= maxPrice &&
    (activeflavour === "All" || item.flavour === activeflavour) &&
    (activeWeight === "All" || item.weight === activeWeight)
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dda56a]"></div>
        <p className="mt-4 text-lg text-[#dda56a]">Loading delicious cakes...</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* HERO SECTION */}
      <div className="relative w-full h-[90vh] overflow-hidden">
        <video className="w-full h-full object-cover" src={cakeVideo} autoPlay muted loop />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-10 md:left-20 text-white max-w-xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Freshly Baked Delights — Crafted With Love & Passion</h1>
          <p className="text-gray-300 text-sm md:text-base">2025 • Premium Bakery • Made Fresh Daily</p>
          <p className="text-gray-200 text-sm md:text-[15px] leading-relaxed">
            Experience the warmth of homemade baking. From artisanal breads to rich cream cakes, every creation is crafted with the finest ingredients.
          </p>
          <div className="flex gap-3 text-sm text-gray-300">
            <span>Cakes</span><span>• Pastries</span><span>• Desserts</span><span>• Custom Orders</span>
          </div>
          <div className="flex items-center gap-4 pt-3">
            <button className="px-6 py-2 rounded-xl font-semibold text-white transition-all hover:brightness-110" style={{ backgroundColor: "#dda56a" }} onClick={() => window.location.href = "/order"}>Order Now</button>
            <button className="w-10 h-10 rounded-md bg-gray-700/70 hover:bg-gray-600 transition text-2xl flex justify-center items-center">+</button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="bg-[#f7efe7] p-6 flex gap-6">
        {/* FILTER SIDEBAR */}
        <div className="hidden lg:block sticky top-28 w-64 h-[calc(100vh-7rem)] bg-white shadow-lg rounded-2xl overflow-y-auto p-5">
          <h2 className="text-xl font-semibold text-[#8b5e3c] mb-4">Filters</h2>

          {/* Price Slider */}
          <div className="mb-4">
            <label className="font-medium text-sm block mb-1">Max Price</label>
            <input 
              type="range" 
              min="100" 
              max="1500" 
              step="50" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))} 
              className="w-full" 
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>₹ 100</span>
              <span className="font-semibold text-[#dda56a]">Up to ₹ {maxPrice}</span>
              <span>₹ 1500</span>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActive(cat)}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all duration-200 text-sm
                    ${active === cat ? "bg-[#dda56a] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* flavours */}
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">flavours</h3>
            <div className="space-y-2">
              {flavours.map(flavour => (
                <button 
                  key={flavour} 
                  onClick={() => setActiveflavour(flavour)}
                  className={`block w-full text-left px-4 py-2 rounded-lg text-sm 
                    ${activeflavour === flavour ? "bg-[#dda56a] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                >
                  {flavour}
                </button>
              ))}
            </div>
          </div>

          {/* Weights */}
          <div className="mb-4">
            <h3 className="font-medium text-sm mb-2">Weights</h3>
            <div className="space-y-2">
              {weights.map(weight => (
                <button 
                  key={weight} 
                  onClick={() => setActiveWeight(weight)}
                  className={`block w-full text-left px-4 py-2 rounded-lg text-sm 
                    ${activeWeight === weight ? "bg-[#dda56a] text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button 
            onClick={() => { 
              setMaxPrice(1500); 
              setActiveflavour("All"); 
              setActiveWeight("All"); 
            }} 
            className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition mt-4"
          >
            Reset Filters
          </button>
        </div>

        {/* MAIN PRODUCT AREA */}
        <div className="flex-1">
          {/* Info bar */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex gap-4 items-center flex-wrap">
              <span className="font-bold text-[#dda56a] px-3 py-1 bg-gray-100 rounded-full text-sm">{active}</span>
              <span className="font-bold text-[#dda56a] text-sm">₹ {maxPrice}</span>
              {activeflavour !== "All" && <span className="font-bold text-[#dda56a] text-sm">{activeflavour}</span>}
              {activeWeight !== "All" && <span className="font-bold text-[#dda56a] text-sm">{activeWeight}</span>}
            </div>
            <p className="text-gray-700 text-sm">
              Showing <span className="font-bold text-[#dda56a]">{filteredData.length}</span> of {products.length} products
            </p>
          </div>

          {/* PRODUCT GRID */}
          <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
            {filteredData.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col">
                <div className="relative h-48 overflow-hidden rounded-xl mb-3">
                  <img 
                    src={item.img} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("❌ Failed to load image:", item.img);
                      // Multiple fallback options
                      if (e.target.src !== '/cake5.jpg') {
                        e.target.src = '/cake5.jpg';
                      } else if (e.target.src !== '/cake1.jpg') {
                        e.target.src = '/cake1.jpg';
                      } else {
                        e.target.src = 'https://via.placeholder.com/300x200/FFE5B4/8B4513?text=Cake+Image';
                      }
                      e.target.onerror = null; // Prevent infinite loop
                    }}
                    onLoad={() => console.log(`✅ Image loaded successfully: ${item.name}`)}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
                    <span className="text-sm font-bold text-[#dda56a]">₹ {item.price}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{item.name}</h3>
                {item.description && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{item.category}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{item.flavour}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{item.weight}</span>
                </div>
                <button 
                  onClick={() => handleAddToCart(item)} 
                  disabled={item.stock === 0} 
                  className={`w-full py-2 rounded-full font-semibold flex items-center justify-center gap-2 
                    ${item.stock === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#dda56a] text-white hover:bg-[#c8955f] transition-all"}`}
                >
                  {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found with current filters.</p>
              <button 
                onClick={() => { 
                  setMaxPrice(1500); 
                  setActiveflavour("All"); 
                  setActiveWeight("All"); 
                }}
                className="mt-4 px-6 py-2 bg-[#dda56a] text-white rounded-lg hover:bg-[#c8955f]"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}