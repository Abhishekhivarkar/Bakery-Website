import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function UpdateProductModal({ productId, onClose }) {
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

        // Load product data
        const p = productRes.data.product;
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: p.price || "",
          category: p.category || "",
          stock: p.stock || "",
          tags: Array.isArray(p.tags) ? p.tags.join(",") : p.tags || "",
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
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to load product!");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndOptions();
  }, [productId, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTagCheckbox = (tag) => {
    let currentTags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (currentTags.includes(tag)) {
      currentTags = currentTags.filter((t) => t !== tag);
    } else {
      currentTags.push(tag);
    }
    setForm((prev) => ({ ...prev, tags: currentTags.join(",") }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatePromise = axios.put(
      `http://localhost:5000/api/product/update/${productId}`,
      {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.promise(updatePromise, {
      loading: "Updating product...",
      success: () => {
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
        return "Product updated successfully!";
      },
      error: (error) => error.response?.data?.message || "Failed to update product!",
    });
  };

  const handleCancel = () => {
    toast("Update cancelled", { icon: "⚠️", duration: 2000 });
    onClose();
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading product…</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 ">
      <div className="w-[95%] max-w-3xl bg-white rounded-2xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Available quantity"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>

          {/* Category & Flavour */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="font-medium">Category</label>
              <div className="flex gap-2 mt-1">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="border p-2 rounded w-[40%]"
                >
                  <option value="">Select</option>
                  {categoryOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="New category"
                  className="border p-2 rounded w-[60%]"
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
            </div>

            {/* Flavour */}
            <div>
              <label className="font-medium">Flavour</label>
              <div className="flex gap-2 mt-1">
                <select
                  name="flavour"
                  value={form.flavour}
                  onChange={handleChange}
                  className="border p-2 rounded w-[40%]"
                >
                  <option value="">Select</option>
                  {flavourOptions.map((f, i) => <option key={i} value={f}>{f}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="New flavour"
                  className="border p-2 rounded w-[60%]"
                  onChange={(e) => setForm(prev => ({ ...prev, flavour: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Weight & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight */}
            <div>
              <label className="font-medium">Weight</label>
              <div className="flex gap-2 mt-1">
                <select
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  className="border p-2 rounded w-[40%]"
                >
                  <option value="">Select</option>
                  {weightOptions.map((w, i) => <option key={i} value={w}>{w}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="New weight"
                  className="border p-2 rounded w-[60%]"
                  onChange={(e) => setForm(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            {/* Tags */}
{/* Tags */}
            <div>
              <label className="font-medium">Tags</label>

              <div className="flex gap-2 mt-1 items-start relative">

                {/* Custom dropdown button */}
                <div className="relative w-[40%]">
                  <button
                    type="button"
                    onClick={() => setShowTagDropdown((prev) => !prev)}
                    className="border p-2 rounded w-full text-left bg-white"
                  >
                    Select Tags
                  </button>

                  {showTagDropdown && (
                    <div className="absolute z-20 bg-white border rounded p-2 w-full max-h-40 overflow-y-auto shadow">
                      {tagOptions.map((tag, i) => (
                        <label key={i} className="flex items-center gap-2 p-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.tags.split(",").includes(tag)}
                            onChange={(e) => {
                              const selected = new Set(
                                form.tags.split(",").filter(Boolean)
                              );

                              if (e.target.checked) selected.add(tag);
                              else selected.delete(tag);

                              setForm((prev) => ({
                                ...prev,
                                tags: Array.from(selected).join(","),
                              }));
                            }}
                          />
                          {tag}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* New tag input */}
                <input
                  type="text"
                  placeholder="New tags (comma separated)"
                  className="border p-2 rounded w-[60%]"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                />
              </div>
            </div>

          </div>

          {/* Featured */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isFeatured" className="text-gray-700 font-medium">
              Mark as Featured Product
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Product
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
