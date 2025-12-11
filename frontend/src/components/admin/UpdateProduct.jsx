import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function UpdateProductModal({ productId, onClose }) {
  // Initialize form with empty strings instead of undefined
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

  const [loading, setLoading] = useState(true);
  const [flavourOptions, setFlavourOptions] = useState([]);
  const [weightOptions, setWeightOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("adminToken");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Fetch product + dropdown options
  useEffect(() => {
    const fetchProductAndOptions = async () => {
      try {
        const [productRes, allProductsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/product/single/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/product`),
        ]);

        // Load product data with fallbacks for undefined values
        const p = productRes.data.product || {};
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: p.price?.toString() || "", // Convert to string
          category: p.category || "",
          stock: p.stock?.toString() || "", // Convert to string
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
          isFeatured: p.isFeatured || false,
          flavour: p.flavour || "",
          weight: p.weight || "",
        });

        // Extract unique options from all products
        const products = allProductsRes.data.products || [];

        setFlavourOptions([...new Set(products.map((p) => p.flavour).filter(Boolean))]);
        setWeightOptions([...new Set(products.map((p) => p.weight).filter(Boolean))]);
        setCategoryOptions([...new Set(products.map((p) => p.category).filter(Boolean))]);

        const allTags = products
          .flatMap((p) =>
            Array.isArray(p.tags)
              ? p.tags
              : typeof p.tags === "string"
              ? p.tags.split(",")
              : []
          )
          .map((t) => t.trim())
          .filter(Boolean);
        setTagOptions([...new Set(allTags)]);

        toast.success("Product loaded successfully!");
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error(error.response?.data?.message || "Failed to load product!");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndOptions();
  }, [productId, token, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate required fields
  if (!form.name || !form.price || !form.category) {
    toast.error("Name, Price, and Category are required!");
    return;
  }
  
  setSubmitting(true);

  try {
    // Prepare data for API
    const updateData = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock) || 0,
      // FIX: Send tags as array
      tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isFeatured: form.isFeatured,
      flavour: form.flavour,
      weight: form.weight,
    };

    console.log("📤 Updating product with data:", updateData);
    console.log("📤 Tags being sent:", updateData.tags);
    console.log("📤 Tags type:", typeof updateData.tags);

    const response = await axios.put(
      `http://localhost:5000/api/product/update/${productId}`,
      updateData,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        } 
      }
    );

    console.log("✅ Product updated:", response.data);
    
    toast.success("Product updated successfully!");
    
    // Delay reload to show success message
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 1500);
    
  } catch (error) {
    console.error("❌ Error updating product:", error);
    
    // Log detailed error information
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    
    toast.error(error.response?.data?.message || "Failed to update product. Check console for details.");
  } finally {
    setSubmitting(false);
  }
};
  if (loading)
    return (
      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dda56a]"></div>
          <p className="mt-4 text-lg text-[#dda56a]">Loading product details...</p>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-3xl relative max-h-[90vh] overflow-y-auto">
        <button 
          className="absolute top-4 right-4 text-2xl hover:text-red-500" 
          onClick={onClose}
          disabled={submitting}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* BASIC FIELDS */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              placeholder="e.g., Chocolate Truffle Cake"
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              placeholder="Describe your product..."
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
              rows="3"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                placeholder="e.g., 499"
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                min="0"
                step="0.01"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium text-gray-700">Stock *</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                placeholder="e.g., 50"
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                min="0"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Category *</label>
            <div className="flex gap-2">
              <select
                name="category"
                onChange={handleChange}
                value={form.category}
                className="border border-gray-300 p-3 rounded w-[40%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                required
                disabled={submitting}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Or enter new category"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="border border-gray-300 p-3 rounded w-[60%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                disabled={submitting}
              />
            </div>
          </div>

          {/* FLAVOUR + WEIGHT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Flavour</label>
              <div className="flex gap-2">
                <select
                  name="flavour"
                  onChange={handleChange}
                  value={form.flavour}
                  className="border border-gray-300 p-2 rounded w-[40%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="">Select Flavour</option>
                  {flavourOptions.map((f, i) => (
                    <option key={i} value={f}>{f}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="New flavour"
                  value={form.flavour}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, flavour: e.target.value }))
                  }
                  className="border border-gray-300 p-2 rounded w-[60%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-gray-700">Weight</label>
              <div className="flex gap-2">
                <select
                  name="weight"
                  onChange={handleChange}
                  value={form.weight}
                  className="border border-gray-300 p-2 rounded w-[40%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="">Select Weight</option>
                  {weightOptions.map((w, i) => (
                    <option key={i} value={w}>{w}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="New weight (e.g., 500g, 1kg)"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  className="border border-gray-300 p-2 rounded w-[60%] focus:ring-2 focus:ring-[#dda56a] focus:border-transparent"
                  disabled={submitting}
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
                  disabled={submitting}
                />
                
                {tagOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {showTagDropdown ? "Hide" : "Show"} Tags
                  </button>
                )}
              </div>
              
              {showTagDropdown && tagOptions.length > 0 && (
                <div className="bg-gray-50 border rounded p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag, i) => {
                      const currentTags = form.tags.split(',').map(t => t.trim()).filter(t => t);
                      const isSelected = currentTags.includes(tag);
                      
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (submitting) return;
                            
                            if (isSelected) {
                              const updatedTags = currentTags.filter(t => t !== tag);
                              setForm(prev => ({
                                ...prev,
                                tags: updatedTags.join(', ')
                              }));
                            } else {
                              setForm(prev => ({
                                ...prev,
                                tags: [...currentTags, tag].join(', ')
                              }));
                            }
                          }}
                          className={`px-3 py-1 border rounded-full text-sm hover:bg-gray-100 transition-colors ${
                            isSelected ? 'bg-[#dda56a] text-white border-[#dda56a]' : 'bg-white'
                          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={submitting}
                        >
                          {tag} {isSelected ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>
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
              className="w-5 h-5 text-[#dda56a] rounded"
              disabled={submitting}
            />
            <label htmlFor="isFeatured" className="font-medium text-gray-700 cursor-pointer">
              Mark as Featured Product
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-3 font-semibold rounded transition ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#dda56a] hover:bg-[#c8955f] text-white"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Product"
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={`flex-1 py-3 bg-gray-300 text-gray-700 font-semibold rounded transition ${
                submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}