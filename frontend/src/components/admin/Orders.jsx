import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaEye, FaTrash, FaCheckCircle, FaTimesCircle, FaClock, FaTruck, FaSync } from 'react-icons/fa';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    // Status options for filtering
    const statusOptions = [
        { value: 'All', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'out-for-delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    // Status badge styling
    const statusColors = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FaClock className="inline mr-1" /> },
        confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <FaCheckCircle className="inline mr-1" /> },
        preparing: { bg: 'bg-orange-100', text: 'text-orange-800', icon: <FaSync className="inline mr-1" /> },
        'out-for-delivery': { bg: 'bg-purple-100', text: 'text-purple-800', icon: <FaTruck className="inline mr-1" /> },
        delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheckCircle className="inline mr-1" /> },
        cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <FaTimesCircle className="inline mr-1" /> }
    };

    // Payment status styling
    const paymentStatusColors = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        paid: { bg: 'bg-green-100', text: 'text-green-800' },
        failed: { bg: 'bg-red-100', text: 'text-red-800' },
        refunded: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    // Fetch all orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.get('http://localhost:5000/api/admin/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrders(response.data.orders);
            } else {
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders based on status
    const filteredOrders = filter === "All" 
        ? orders 
        : orders.filter(order => order.orderStatus === filter);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate total revenue
    const totalRevenue = orders
        .filter(order => order.orderStatus === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate pending orders count
    const pendingOrders = orders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'out-for-delivery'].includes(order.orderStatus)
    ).length;

    // View order details
    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.put(
                `http://localhost:5000/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                fetchOrders(); // Refresh orders
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        }
    };

    // Delete order
    const deleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            
            const response = await axios.delete(
                `http://localhost:5000/api/admin/orders/${orderId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('Order deleted successfully');
                fetchOrders(); // Refresh orders
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Failed to delete order');
        }
    };

    // Close order details modal
    const closeOrderDetails = () => {
        setShowOrderDetails(false);
        setSelectedOrder(null);
    };

    if (loading) {
        return (
            <div className="p-10">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d69e64]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#3f2e20] mb-2">Orders Management</h2>
                <p className="text-gray-600">Manage all customer orders from here</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-[#f1e5d8]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold text-[#3f2e20]">{orders.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xl">📦</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-[#f1e5d8]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Orders</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-yellow-600 text-xl">⏳</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-[#f1e5d8]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 text-xl">💰</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-[#f1e5d8]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Today's Orders</p>
                            <p className="text-2xl font-bold text-[#3f2e20]">
                                {orders.filter(order => {
                                    const today = new Date().toDateString();
                                    const orderDate = new Date(order.createdAt).toDateString();
                                    return today === orderDate;
                                }).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 text-xl">📅</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                {statusOptions.map((status) => (
                    <button
                        key={status.value}
                        onClick={() => setFilter(status.value)}
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-all duration-200
                            shadow-sm border text-sm
                            ${filter === status.value
                                ? 'bg-[#d69e64] text-white border-transparent'
                                : 'bg-white text-[#3f2e20] border-[#d9c1aa] hover:bg-[#f7e8dc]'
                            }
                        `}
                    >
                        {status.label}
                    </button>
                ))}
                
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
                >
                    <FaSync /> Refresh
                </button>
            </div>

            {/* Orders Table */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#f1e5d8] overflow-auto">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
                        <p className="text-gray-500">
                            {filter === "All" 
                                ? "No orders have been placed yet." 
                                : `No orders with status "${filter}" found.`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max">
                            <thead>
                                <tr className="bg-[#f7e8dc] text-[#3f2e20]">
                                    <th className="py-3 px-4 text-left font-semibold text-sm">Order ID</th>
                                    <th className="py-3 px-4 text-left font-semibold text-sm">Customer</th>
                                    <th className="py-3 px-4 text-left font-semibold text-sm">Items</th>
                                    <th className="py-3 px-4 text-left font-semibold text-sm">Total Amount</th>
                                    <th className="py-3 px-4 text-left font-semibold text-sm">Status</th>
                                    <th className="py-3 px-4 text-left font-semibold text-sm">Payment</th>
                                    <th className="py-3 px-4 text-left font-semibold text-sm">Date</th>
                                    <th className="py-3 px-4 text-left font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="border-b border-[#f1e5d8] hover:bg-[#fff7f1] transition-all"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-sm">
                                                #{order._id.toString().slice(-8).toUpperCase()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.orderNumber || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium">{order.user?.name || 'Customer'}</div>
                                            <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm">{order.items.length} items</div>
                                            <div className="text-xs text-gray-500">
                                                {order.items.slice(0, 2).map(item => item.name).join(', ')}
                                                {order.items.length > 2 && '...'}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-[#3f2e20]">₹{order.totalAmount.toFixed(2)}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${statusColors[order.orderStatus]?.bg} ${statusColors[order.orderStatus]?.text}`}>
                                                {statusColors[order.orderStatus]?.icon}
                                                {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[order.paymentStatus]?.bg} ${paymentStatusColors[order.paymentStatus]?.text}`}>
                                                {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm">{formatDate(order.createdAt)}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => viewOrderDetails(order)}
                                                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                
                                                {/* Status Update Dropdown */}
                                                <select
                                                    value={order.orderStatus}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="out-for-delivery">Out for Delivery</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                
                                                <button
                                                    onClick={() => deleteOrder(order._id)}
                                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                                    title="Delete Order"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-[#3f2e20]">Order Details</h3>
                                    <p className="text-gray-600 text-sm">Order #{selectedOrder._id.toString().slice(-8).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={closeOrderDetails}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Order Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="font-bold text-[#3f2e20] mb-2">Customer Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p><span className="font-medium">Name:</span> {selectedOrder.user?.name || 'N/A'}</p>
                                        <p><span className="font-medium">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                                        <p><span className="font-medium">Phone:</span> {selectedOrder.user?.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-[#3f2e20] mb-2">Order Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p><span className="font-medium">Status:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${statusColors[selectedOrder.orderStatus]?.bg} ${statusColors[selectedOrder.orderStatus]?.text}`}>
                                                {selectedOrder.orderStatus}
                                            </span>
                                        </p>
                                        <p><span className="font-medium">Payment:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${paymentStatusColors[selectedOrder.paymentStatus]?.bg} ${paymentStatusColors[selectedOrder.paymentStatus]?.text}`}>
                                                {selectedOrder.paymentStatus}
                                            </span>
                                        </p>
                                        <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                                        <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="mb-6">
                                <h4 className="font-bold text-[#3f2e20] mb-2">Shipping Address</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p>{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                    <p>{selectedOrder.shippingAddress?.zipCode} - {selectedOrder.shippingAddress?.country}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h4 className="font-bold text-[#3f2e20] mb-2">Order Items ({selectedOrder.items.length})</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                                            {item.img && (
                                                <img 
                                                    src={item.img} 
                                                    alt={item.name} 
                                                    className="w-16 h-16 rounded object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">₹{item.price.toFixed(2)}</p>
                                                <p className="text-sm text-gray-600">Total: ₹{(item.price * item.qty).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-[#3f2e20] mb-2">Order Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>₹{selectedOrder.subtotal?.toFixed(2) || selectedOrder.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax:</span>
                                        <span>₹{selectedOrder.tax?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Charge:</span>
                                        <span>₹{selectedOrder.deliveryCharge || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total Amount:</span>
                                        <span className="text-[#d69e64]">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={closeOrderDetails}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        // Print order
                                        window.print();
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;