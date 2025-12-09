import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Notification from '../../../../components/Notification';
import './styles/ProductSettings.css';

export default function ProductSettings() {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserOrders, setSelectedUserOrders] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [processingOrders, setProcessingOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stock');
    const [notification, setNotification] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [editForm, setEditForm] = useState({
        product_name: '',
        description: '',
        price: '',
        stock_quantity: '',
        is_active: 1
    });

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const selectStyles = {
        control: (base) => ({
            ...base,
            background: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 107, 53, 0.3)',
            color: '#fff',
            minHeight: '38px',
            '&:hover': {
                borderColor: '#ff6b35'
            }
        }),
        menu: (base) => ({
            ...base,
            background: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 107, 53, 0.3)'
        }),
        option: (base, state) => ({
            ...base,
            background: state.isFocused ? 'rgba(255, 107, 53, 0.2)' : 'transparent',
            color: '#fff',
            '&:hover': {
                background: 'rgba(255, 107, 53, 0.3)'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: '#fff'
        })
    };

    useEffect(() => {
        fetchProducts();
        if (activeTab === 'orders') {
            fetchUsers();
        } else if (activeTab === 'processing') {
            fetchProcessingOrders();
        } else if (activeTab === 'cancelled') {
            fetchCancelledOrders();
        }
    }, [activeTab]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Fetch products error:', error);
            setNotification({ message: 'Failed to load products', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.users || data);
        } catch (error) {
            console.error('Fetch users error:', error);
            setNotification({ message: 'Failed to load users', type: 'error' });
        }
    };

    const fetchUserOrders = async (userId, username) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/orders`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch user orders');
            const data = await res.json();
            setSelectedUserOrders(data);
            setSelectedUser({ id: userId, username });
        } catch (error) {
            console.error('Fetch user orders error:', error);
            setNotification({ message: 'Failed to load user orders', type: 'error' });
        }
    };

    const fetchProcessingOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders?status=processing', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch processing orders');
            const data = await res.json();
            setProcessingOrders(data);
        } catch (error) {
            console.error('Fetch processing orders error:', error);
            setNotification({ message: 'Failed to load processing orders', type: 'error' });
        }
    };

    const fetchCancelledOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders?status=cancelled', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch cancelled orders');
            const data = await res.json();
            setCancelledOrders(data);
        } catch (error) {
            console.error('Fetch cancelled orders error:', error);
            setNotification({ message: 'Failed to load cancelled orders', type: 'error' });
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setEditForm({
            product_name: product.product_name,
            description: product.description,
            price: product.price,
            stock_quantity: product.stock_quantity,
            is_active: product.is_active
        });
        setShowEditModal(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editForm)
            });

            if (!res.ok) throw new Error('Failed to update product');
            
            setNotification({ message: 'Product updated successfully!', type: 'success' });
            setShowEditModal(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('Update error:', error);
            setNotification({ message: 'Failed to update product', type: 'error' });
        }
    };

    const handleToggleActive = async (productId, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/products/${productId}/toggle-active`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ is_active: currentStatus ? 0 : 1 })
            });

            if (!res.ok) throw new Error('Failed to toggle product status');
            
            setNotification({ 
                message: currentStatus ? 'Product marked as sold out' : 'Product activated', 
                type: 'success' 
            });
            fetchProducts();
        } catch (error) {
            console.error('Toggle error:', error);
            setNotification({ message: 'Failed to update status', type: 'error' });
        }
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Failed to delete product');
            
            setNotification({ message: 'Product moved to deleted products', type: 'success' });
            setShowDeleteConfirm(false);
            setProductToDelete(null);
            fetchProducts();
        } catch (error) {
            console.error('Delete error:', error);
            setNotification({ message: 'Failed to delete product', type: 'error' });
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Failed to update order status');
            
            setNotification({ message: 'Order status updated', type: 'success' });
            fetchOrders();
        } catch (error) {
            console.error('Update order error:', error);
            setNotification({ message: 'Failed to update order', type: 'error' });
        }
    };

    if (loading) {
        return <div className="ps-loading">Loading products...</div>;
    }

    return (
        <div className="product-settings">
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="ps-header">
                <h2>Product Management</h2>
                <div className="ps-tabs">
                    <button 
                        className={`ps-tab ${activeTab === 'stock' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stock')}
                    >
                        Stock Management
                    </button>
                    <button 
                        className={`ps-tab ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        User Orders
                    </button>
                    <button 
                        className={`ps-tab ${activeTab === 'processing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('processing')}
                    >
                        Processing Orders
                    </button>
                    <button 
                        className={`ps-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cancelled')}
                    >
                        Cancelled Orders
                    </button>
                </div>
            </div>

            {activeTab === 'stock' && (
                <div className="ps-content">
                    <div className="ps-products-grid">
                        {products.map(product => (
                            <div key={product.id} className={`ps-product-card ${!product.is_active ? 'sold-out' : ''}`}>
                                <div className="ps-product-header">
                                    <h3>{product.product_name}</h3>
                                    <span className={`ps-status ${product.is_active ? 'active' : 'inactive'}`}>
                                        {product.is_active ? 'Available' : 'Sold Out'}
                                    </span>
                                </div>
                                
                                <div className="ps-product-info">
                                    <div className="ps-info-row">
                                        <span className="ps-label">Price:</span>
                                        <span className="ps-value">${product.price}</span>
                                    </div>
                                    <div className="ps-info-row">
                                        <span className="ps-label">Stock:</span>
                                        <span className={`ps-value ${product.stock_quantity < 10 ? 'low-stock' : ''}`}>
                                            {product.stock_quantity} units
                                        </span>
                                    </div>
                                    <div className="ps-info-row">
                                        <span className="ps-label">Description:</span>
                                        <span className="ps-value ps-desc">{product.description}</span>
                                    </div>
                                </div>

                                <div className="ps-product-actions">
                                    <button 
                                        className="ps-btn ps-btn-edit"
                                        onClick={() => handleEditClick(product)}
                                    >
                                        <i className="fas fa-edit"></i> Edit
                                    </button>
                                    <button 
                                        className={`ps-btn ${product.is_active ? 'ps-btn-deactivate' : 'ps-btn-activate'}`}
                                        onClick={() => handleToggleActive(product.id, product.is_active)}
                                    >
                                        <i className={`fas fa-${product.is_active ? 'ban' : 'check'}`}></i>
                                        {product.is_active ? 'Mark Sold Out' : 'Activate'}
                                    </button>
                                    <button 
                                        className="ps-btn ps-btn-delete"
                                        onClick={() => handleDeleteClick(product)}
                                    >
                                        <i className="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="ps-content">
                    {!selectedUser ? (
                        <div className="ps-users-table">
                            <h3 className="ps-section-title">Select a User to View Their Orders</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? users.map(user => (
                                        <tr key={user.id}>
                                            <td>#{user.id}</td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.first_name} {user.last_name}</td>
                                            <td>
                                                <button 
                                                    className="ps-btn ps-btn-view"
                                                    onClick={() => fetchUserOrders(user.id, user.username)}
                                                >
                                                    <i className="fas fa-eye"></i> View Orders
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="no-orders">No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="ps-orders-view">
                            <div className="ps-orders-header">
                                <button 
                                    className="ps-btn-back-small"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setSelectedUserOrders([]);
                                    }}
                                >
                                    <i className="fas fa-arrow-left"></i> Back to Users
                                </button>
                                <h3 className="ps-section-title">Orders for {selectedUser.username}</h3>
                            </div>
                            <div className="ps-orders-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Products</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedUserOrders.length > 0 ? selectedUserOrders.map(order => (
                                            <tr key={order.id}>
                                                <td>{order.order_number}</td>
                                                <td>{order.products}</td>
                                                <td>{order.total_quantity}</td>
                                                <td>${order.total}</td>
                                                <td>
                                                    <span className={`order-status status-${order.status}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                                <td>
                                                    <Select
                                                        value={statusOptions.find(opt => opt.value === order.status)}
                                                        onChange={(selected) => handleUpdateOrderStatus(order.id, selected.value)}
                                                        options={statusOptions}
                                                        styles={selectStyles}
                                                        className="react-select-container"
                                                        classNamePrefix="react-select"
                                                    />
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="no-orders">No orders found for this user</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'processing' && (
                <div className="ps-content">
                    <div className="ps-orders-table">
                        <h3 className="ps-section-title">Processing Orders</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>User</th>
                                    <th>Products</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processingOrders.length > 0 ? processingOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.order_number}</td>
                                        <td>{order.username}</td>
                                        <td>{order.products}</td>
                                        <td>{order.total_quantity}</td>
                                        <td>${order.total}</td>
                                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                        <td>
                                            <Select
                                                value={statusOptions.find(opt => opt.value === order.status)}
                                                onChange={(selected) => {
                                                    handleUpdateOrderStatus(order.id, selected.value);
                                                    fetchProcessingOrders();
                                                }}
                                                options={statusOptions}
                                                styles={selectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="no-orders">No processing orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'cancelled' && (
                <div className="ps-content">
                    <div className="ps-orders-table">
                        <h3 className="ps-section-title">Cancelled Orders</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>User</th>
                                    <th>Products</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cancelledOrders.length > 0 ? cancelledOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.order_number}</td>
                                        <td>{order.username}</td>
                                        <td>{order.products}</td>
                                        <td>{order.total_quantity}</td>
                                        <td>${order.total}</td>
                                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                        <td>
                                            <Select
                                                value={statusOptions.find(opt => opt.value === order.status)}
                                                onChange={(selected) => {
                                                    handleUpdateOrderStatus(order.id, selected.value);
                                                    fetchCancelledOrders();
                                                }}
                                                options={statusOptions}
                                                styles={selectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="no-orders">No cancelled orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && (
                <div className="ps-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ps-modal-header">
                            <h3>Edit Product</h3>
                            <button className="ps-modal-close" onClick={() => setShowEditModal(false)}>
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProduct} className="ps-modal-form">
                            <div className="ps-form-group">
                                <label>Product Name</label>
                                <input 
                                    type="text"
                                    value={editForm.product_name}
                                    onChange={(e) => setEditForm({...editForm, product_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="ps-form-group">
                                <label>Description ({editForm.description.length}/150)</label>
                                <textarea 
                                    value={editForm.description}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 150) {
                                            setEditForm({...editForm, description: value});
                                        }
                                    }}
                                    rows="3"
                                    maxLength="150"
                                    placeholder="Enter product description (max 150 characters)"
                                />
                            </div>
                            <div className="ps-form-row">
                                <div className="ps-form-group">
                                    <label>Price ($)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="ps-form-group">
                                    <label>Stock Quantity</label>
                                    <input 
                                        type="number"
                                        value={editForm.stock_quantity}
                                        onChange={(e) => setEditForm({...editForm, stock_quantity: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="ps-form-group">
                                <label className="ps-checkbox-label">
                                    <input 
                                        type="checkbox"
                                        checked={editForm.is_active === 1}
                                        onChange={(e) => setEditForm({...editForm, is_active: e.target.checked ? 1 : 0})}
                                    />
                                    <span>Product is active</span>
                                </label>
                            </div>
                            <div className="ps-modal-actions">
                                <button type="button" className="ps-btn ps-btn-cancel" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="ps-btn ps-btn-save">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="ps-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="ps-modal ps-modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="ps-modal-header">
                            <h3>Confirm Delete</h3>
                            <button className="ps-modal-close" onClick={() => setShowDeleteConfirm(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="ps-modal-body">
                            <p>Are you sure you want to delete <strong>{productToDelete?.product_name}</strong>?</p>
                            <p className="ps-warning">This will move the product to the deleted products table.</p>
                        </div>
                        <div className="ps-modal-actions">
                            <button className="ps-btn ps-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </button>
                            <button className="ps-btn ps-btn-delete" onClick={handleDeleteConfirm}>
                                Delete Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
