import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CreateProductModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    tags: "",
    isFeatured: false,
    flavour: "",
    weight: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Default hardcoded options (used when database is empty)
  const DEFAULT_CATEGORIES = [
    "Classic Cakes", 
    "Premium Cakes", 
    "Cupcakes", 
    "Pastries", 
    "Cookies", 
    "Breads", 
    "Custom Cakes",
    "Desserts",
    "Birthday Cakes",
    "Wedding Cakes"
  ];
  
  const DEFAULT_FLAVOURS = [
    "Vanilla", 
    "Chocolate", 
    "Strawberry", 
    "Butterscotch", 
    "Red Velvet", 
    "Pineapple", 
    "Mango",
    "Coffee",
    "Caramel",
    "Mixed Fruit"
  ];
  
  const DEFAULT_WEIGHTS = [
    "250g", 
    "500g", 
    "1kg", 
    "1.5kg", 
    "2kg", 
    "3kg", 
    "5kg",
    "Custom"
  ];
  
  const DEFAULT_TAGS = [
    "Best Seller",
    "New Arrival",
    "Vegan",
    "Eggless",
    "Sugar Free",
    "Birthday",
    "Anniversary",
    "Wedding",
    "Festival",
    "Premium"
  ];

  // Dropdown options (will be populated from DB + defaults)
  const [flavourOptions, setFlavourOptions] = useState(DEFAULT_FLAVOURS);
  const [weightOptions, setWeightOptions] = useState(DEFAULT_WEIGHTS);
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORIES);
  const [tagOptions, setTagOptions] = useState(DEFAULT_TAGS);

  // Tag dropdown open/close
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/product");

        if (res.data?.success) {
          const products = res.data.products;

          // Merge database options with defaults (remove duplicates)
          if (products.length > 0) {
            // Get unique categories from DB
            const dbCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
            const mergedCategories = [...new Set([...DEFAULT_CATEGORIES, ...dbCategories])];
            setCategoryOptions(mergedCategories);

            // Get unique flavours from DB
            const dbFlavours = [...new Set(products.map((p) => p.flavour).filter(Boolean))];
            const mergedFlavours = [...new Set([...DEFAULT_FLAVOURS, ...dbFlavours])];
            setFlavourOptions(mergedFlavours);

            // Get unique weights from DB
            const dbWeights = [...new Set(products.map((p) => p.weight).filter(Boolean))];
            const mergedWeights = [...new Set([...DEFAULT_WEIGHTS, ...dbWeights])];
            setWeightOptions(mergedWeights);

            // Get tags from DB
            const dbTags = products
              .flatMap((p) =>
                Array.isArray(p.tags)
                  ? p.tags
                  : typeof p.tags === "string"
                  ? p.tags.split(",")
                  : []
              )
              .map((t) => t.trim())
              .filter(Boolean);
            
            const mergedTags = [...new Set([...DEFAULT_TAGS, ...dbTags])];
            setTagOptions(mergedTags);
          }
          // If no products, keep using the defaults
        }
      } catch (err) {
        console.error("Failed to load dropdown options, using defaults", err);
        // Keep using default options if API fails
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewUrls];
    
    // Revoke the object URL to prevent memory leak
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.price || !form.category) {
      alert("Name, Price, and Category are required!");
      return;
    }
    
    if (images.length === 0) {
      alert("Please upload at least one image!");
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Admin authentication required! Please login again.");
        onClose();
        return;
      }

      const formData = new FormData();
      
      // Append all form fields
      Object.keys(form).forEach((key) => {
        if (key === 'isFeatured') {
          formData.append(key, form[key] ? 'true' : 'false');
        } else {
          formData.append(key, form[key]);
        }
      });

      // Append images
      images.forEach((img) => {
        formData.append("images", img);
      });

      console.log("📤 Creating product with data:", {
        name: form.name,
        price: form.price,
        category: form.category,
        imagesCount: images.length
      });

      // IMPORTANT: Use admin route for product creation
      const res = await axios.post(
        "http://localhost:5000/api/admin/product", // Changed to admin route
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Product created:", res.data);

      if (onSave) onSave(res.data.product);
      
      // Clear preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      onClose();
      
    } catch (error) {
      console.error("❌ Error creating product:", error);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-3xl relative max-h-[90vh] overflow-y-auto">
        <button 
          className="absolute top-4 right-4 text-2xl hover:text-red-500" 
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* BASIC FIELDS */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Product Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Chocolate Truffle Cake"
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              placeholder="Describe your product..."
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Price (₹) *</label>
              <input
                type="number"
                name="price"
                placeholder="e.g., 499"
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium text-gray-700">Stock *</label>
              <input
                type="number"
                name="stock"
                placeholder="e.g., 50"
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Category *</label>
            <div className="flex gap-2">
              <div className="relative w-[40%]">
                <select
                  name="category"
                  onChange={handleChange}
                  value={form.category}
                  className="border border-gray-300 p-3 rounded w-full focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categoryOptions.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
                {form.category && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, category: '' }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                    title="Clear selection"
                  >
                    ✕
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Or enter custom category"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="border border-gray-300 p-3 rounded w-[60%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
              />
            </div>
          </div>

          {/* FLAVOUR + WEIGHT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Flavour</label>
              <div className="flex gap-2">
                <div className="relative w-[40%]">
                  <select
                    name="flavour"
                    onChange={handleChange}
                    value={form.flavour}
                    className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                  >
                    <option value="">-- Select Flavour --</option>
                    {flavourOptions.map((f, i) => (
                      <option key={i} value={f}>{f}</option>
                    ))}
                  </select>
                  {form.flavour && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, flavour: '' }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                      title="Clear selection"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Custom flavour"
                  value={form.flavour}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, flavour: e.target.value }))
                  }
                  className="border border-gray-300 p-2 rounded w-[60%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-gray-700">Weight</label>
              <div className="flex gap-2">
                <div className="relative w-[40%]">
                  <select
                    name="weight"
                    onChange={handleChange}
                    value={form.weight}
                    className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                  >
                    <option value="">-- Select Weight --</option>
                    {weightOptions.map((w, i) => (
                      <option key={i} value={w}>{w}</option>
                    ))}
                  </select>
                  {form.weight && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, weight: '' }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
                      title="Clear selection"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Custom weight (e.g., 500g, 1kg)"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  className="border border-gray-300 p-2 rounded w-[60%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* TAGS */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Tags</label>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter tags separated by commas (e.g., chocolate, birthday, vegan)"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                />
                
                <button
                  type="button"
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  {showTagDropdown ? "Hide" : "Show"} Tags
                </button>
              </div>
              
              {showTagDropdown && (
                <div className="bg-gray-50 border rounded p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const currentTags = form.tags.split(',').map(t => t.trim()).filter(t => t);
                          if (!currentTags.includes(tag)) {
                            setForm(prev => ({
                              ...prev,
                              tags: [...currentTags, tag].join(', ')
                            }));
                          }
                        }}
                        className="px-3 py-1 bg-white border rounded-full text-sm hover:bg-gray-100 transition"
                      >
                        {tag} +
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click to add tags. Type custom tags separated by commas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FEATURED CHECKBOX */}
          <div className="flex gap-3 items-center p-3 bg-gray-50 rounded">
            <input 
              type="checkbox" 
              id="isFeatured" 
              name="isFeatured" 
              checked={form.isFeatured} 
              onChange={handleChange}
              className="w-5 h-5 text-[#dda56a] rounded focus:ring-[#dda56a]"
            />
            <label htmlFor="isFeatured" className="font-medium text-gray-700 cursor-pointer">
              Mark as Featured Product
            </label>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="space-y-3">
            <label className="font-medium text-gray-700">Product Images *</label>
            
            {/* File input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#dda56a] transition cursor-pointer group">
              <input
                type="file"
                id="imageUpload"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-[#dda56a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600">Click to upload images</p>
                  <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP (Max 10MB each)</p>
                  <p className="text-xs text-gray-400">At least one image is required</p>
                </div>
              </label>
            </div>

            {/* Preview images */}
            {previewUrls.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-700 mb-2">
                  Selected Images ({images.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded shadow-sm group-hover:shadow-md transition"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {images[index].name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded font-medium hover:bg-gray-50 transition flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded font-semibold flex-1 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#dda56a] hover:bg-[#c8955f] text-white"
              } transition`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}