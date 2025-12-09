import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateProductModal from "./CreateProduct";
import UpdateProductModal from "./UpdateProduct";
import toast, { Toaster } from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const res = await axios.get("http://localhost:5000/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err.response?.data?.message || "Failed to load products");
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = (newProduct) => {
    if (!newProduct) return;
    setProducts((prev) => [...prev, newProduct]);
    toast.success("Product added successfully!");
  };

  const handleDeleteProduct = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `http://localhost:5000/api/admin/product/${deleteProductId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));
      setShowDeleteModal(false);
      setDeleteProductId(null);

      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-4 py-2 bg-[#d69e64] text-white rounded-2xl hover:bg-[#b9854f]"
      >
        + Add New Product
      </button>

      <div className="bg-white p-4 rounded-xl shadow overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f7e8dc] text-[#3f2e20]">
              <th className="py-4 px-5 text-left font-semibold">Product</th>
              <th className="py-4 px-5 text-left font-semibold">Category</th>
              <th className="py-4 px-5 text-left font-semibold">Price</th>
              <th className="py-4 px-5 text-left font-semibold">Stock</th>
              <th className="py-4 px-5 text-left font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-5">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-red-500">
                  {error}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 text-[#3f2e20]">
                  <td className="py-4 px-5">{p.name}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedProductId(p._id);
                        setShowUpdateModal(true);
                      }}
                      className="px-3 py-2 bg-yellow-400 hover:bg-yellow-600 rounded mr-2"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => {
                        setDeleteProductId(p._id);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-2 bg-red-400 hover:bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showModal && (
        <CreateProductModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
        />
      )}

      {/* UPDATE PRODUCT MODAL */}
      {showUpdateModal && (
        <UpdateProductModal
          productId={selectedProductId}
          onClose={() => setShowUpdateModal(false)}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-md p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Delete Product?
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
