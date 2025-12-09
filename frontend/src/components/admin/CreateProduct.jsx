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

  // Dropdown options
  const [flavourOptions, setFlavourOptions] = useState([]);
  const [weightOptions, setWeightOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  // Tag dropdown open/close
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/product");

        if (res.data?.success) {
          const products = res.data.products;

          setFlavourOptions([
            ...new Set(products.map((p) => p.flavour).filter(Boolean)),
          ]);

          setWeightOptions([
            ...new Set(products.map((p) => p.weight).filter(Boolean)),
          ]);

          setCategoryOptions([
            ...new Set(products.map((p) => p.category).filter(Boolean)),
          ]);

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
        }
      } catch (err) {
        console.error("Failed to load dropdown options", err);
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
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");

      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      images.forEach((img) => formData.append("images", img));

      const res = await axios.post(
        "http://localhost:5000/api/product/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (onSave) onSave(res.data.product);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-3xl relative">
        <button className="absolute top-4 right-4 text-2xl" onClick={onClose}>
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4">Create Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* BASIC FIELDS */}
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              placeholder="Price"
              onChange={handleChange}
              className="w-full border p-3 rounded"
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock"
              onChange={handleChange}
              className="w-full border p-3 rounded"
            />
          </div>

          {/* CATEGORY + TAGS */}
          <div className="grid grid-cols-2 gap-6">

            {/* CATEGORY */}
            <div>
              <label className="font-medium">Category</label>
              <div className="flex gap-2 mt-1">
                <select
                  name="category"
                  onChange={handleChange}
                  value={form.category}
                  className="border p-2 rounded w-[40%]"
                >
                  <option value="">Select</option>
                  {categoryOptions.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="New category"
                  className="border p-2 rounded w-[60%]"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* TAGS MULTISELECT */}
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

          {/* FLAVOUR + WEIGHT */}
          <div className="grid grid-cols-2 gap-6">

            {/* FLAVOUR */}
            <div>
              <label className="font-medium">Flavour</label>
              <div className="flex gap-2 mt-1">
                <select
                  name="flavour"
                  onChange={handleChange}
                  value={form.flavour}
                  className="border p-2 rounded w-[40%]"
                >
                  <option value="">Select</option>
                  {flavourOptions.map((f, i) => (
                    <option key={i} value={f}>{f}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="New flavour"
                  className="border p-2 rounded w-[60%]"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, flavour: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* WEIGHT */}
            <div>
              <label className="font-medium">Weight</label>
              <div className="flex gap-2 mt-1">
                <select
                  name="weight"
                  onChange={handleChange}
                  value={form.weight}
                  className="border p-2 rounded w-[40%]"
                >
                  <option value="">Select</option>
                  {weightOptions.map((w, i) => (
                    <option key={i} value={w}>{w}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="New weight"
                  className="border p-2 rounded w-[60%]"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* FEATURED */}
          <div className="flex gap-2 items-center">
            <input type="checkbox" name="isFeatured" onChange={handleChange} />
            <label>Featured Product</label>
          </div>

          {/* IMAGES */}
          <div>
            <label className="font-medium mb-1">Product Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              className="block"
            />

            {images.length > 0 && (
              <ul className="text-sm mt-2">
                {images.map((img, i) => (
                  <li key={i}>📄 {img.name}</li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
