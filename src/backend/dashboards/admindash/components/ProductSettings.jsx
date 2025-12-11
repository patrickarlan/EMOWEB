import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Notification from '../../../../components/Notification';
import './styles/ProductSettings.css';

export default function ProductSettings() {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserOrders, setSelectedUserOrders] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [processingOrders, setProcessingOrders] = useState([]);
    const [shippedOrders, setShippedOrders] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stock');
    const [notification, setNotification] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    
    // Search states
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [pendingSearchQuery, setPendingSearchQuery] = useState('');
    const [processingSearchQuery, setProcessingSearchQuery] = useState('');
    const [shippedSearchQuery, setShippedSearchQuery] = useState('');
    const [deliveredSearchQuery, setDeliveredSearchQuery] = useState('');
    const [cancelledSearchQuery, setCancelledSearchQuery] = useState('');

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
            border: '1px solid rgba(255, 107, 53, 0.3)',
            zIndex: 9999
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
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
        } else if (activeTab === 'pending') {
            fetchPendingOrders();
        } else if (activeTab === 'processing') {
            fetchProcessingOrders();
        } else if (activeTab === 'shipped') {
            fetchShippedOrders();
        } else if (activeTab === 'delivered') {
            fetchDeliveredOrders();
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

    const fetchPendingOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders?status=pending', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch pending orders');
            const data = await res.json();
            setPendingOrders(data);
        } catch (error) {
            console.error('Fetch pending orders error:', error);
            setNotification({ message: 'Failed to load pending orders', type: 'error' });
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

    const fetchShippedOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders?status=shipped', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch shipped orders');
            const data = await res.json();
            setShippedOrders(data);
        } catch (error) {
            console.error('Fetch shipped orders error:', error);
            setNotification({ message: 'Failed to load shipped orders', type: 'error' });
        }
    };

    const fetchDeliveredOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders?status=delivered', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch delivered orders');
            const data = await res.json();
            setDeliveredOrders(data);
        } catch (error) {
            console.error('Fetch delivered orders error:', error);
            setNotification({ message: 'Failed to load delivered orders', type: 'error' });
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

    // Filter functions
    const filterUsers = (users) => {
        if (!userSearchQuery.trim()) return users;
        const query = userSearchQuery.toLowerCase();
        return users.filter(user => 
            user.id.toString().includes(query) ||
            user.username?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.first_name?.toLowerCase().includes(query) ||
            user.last_name?.toLowerCase().includes(query) ||
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
        );
    };

    const filterOrders = (orders, searchQuery) => {
        if (!searchQuery.trim()) return orders;
        const query = searchQuery.toLowerCase();
        return orders.filter(order =>
            order.order_number?.toLowerCase().includes(query) ||
            order.username?.toLowerCase().includes(query) ||
            order.products?.toLowerCase().includes(query) ||
            order.id.toString().includes(query)
        );
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

    const handleUpdateOrderStatus = async (orderId, newStatus, refetchCallback, currentStatus) => {
        // Prevent reverting from shipped or delivered to earlier statuses
        if ((currentStatus === 'shipped' || currentStatus === 'delivered') && 
            (newStatus === 'pending' || newStatus === 'processing')) {
            setNotification({ 
                message: 'Cannot revert shipped/delivered orders to pending/processing', 
                type: 'error' 
            });
            return;
        }

        // Show confirmation for shipped and delivered
        if (newStatus === 'shipped' || newStatus === 'delivered') {
            setConfirmModal({
                orderId,
                newStatus,
                refetchCallback,
                message: newStatus === 'shipped' 
                    ? 'Mark this order as shipped? Stock will be decremented.'
                    : 'Mark this order as delivered?'
            });
            return;
        }

        // Update without confirmation for other statuses
        await updateOrderStatusAPI(orderId, newStatus, refetchCallback);
    };

    const updateOrderStatusAPI = async (orderId, newStatus, refetchCallback) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Failed to update order status');
            
            const data = await res.json();
            setNotification({ 
                message: data.stockUpdated 
                    ? 'Order shipped! Stock has been updated.' 
                    : 'Order status updated', 
                type: 'success' 
            });
            if (refetchCallback) refetchCallback();
            fetchProducts(); // Refresh product stock display
        } catch (error) {
            console.error('Update order error:', error);
            setNotification({ message: 'Failed to update order', type: 'error' });
        }
    };

    const handleConfirmStatusChange = async () => {
        if (confirmModal) {
            await updateOrderStatusAPI(
                confirmModal.orderId, 
                confirmModal.newStatus, 
                confirmModal.refetchCallback
            );
            setConfirmModal(null);
        }
    };

    const handleCancelStatusChange = () => {
        setConfirmModal(null);
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
                        className={`ps-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending
                    </button>
                    <button 
                        className={`ps-tab ${activeTab === 'processing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('processing')}
                    >
                        Processing
                    </button>
                    <button 
                        className={`ps-tab ${activeTab === 'shipped' ? 'active' : ''}`}
                        onClick={() => setActiveTab('shipped')}
                    >
                        Shipped
                    </button>
                    <button 
                        className={`ps-tab ${activeTab === 'delivered' ? 'active' : ''}`}
                        onClick={() => setActiveTab('delivered')}
                    >
                        Delivered
                    </button>
                    <button 
                        className={`ps-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cancelled')}
                    >
                        Cancelled
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
                            <div className="ps-search-bar">
                                <input
                                    type="text"
                                    placeholder="Search by User ID, Username, Email, or Name..."
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    className="ps-search-input"
                                />
                                {userSearchQuery && (
                                    <button 
                                        className="ps-clear-search"
                                        onClick={() => setUserSearchQuery('')}
                                        aria-label="Clear search"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
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
                                    {filterUsers(users).length > 0 ? filterUsers(users).map(user => (
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
                                            <td colSpan="5" className="no-orders">
                                                {userSearchQuery ? 'No users match your search' : 'No users found'}
                                            </td>
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
                                                        onChange={(selected) => handleUpdateOrderStatus(order.id, selected.value, () => fetchUserOrders(selectedUser.id, selectedUser.username), order.status)}
                                                        options={statusOptions}
                                                        styles={selectStyles}
                                                        className="react-select-container"
                                                        classNamePrefix="react-select"
                                                        menuPortalTarget={document.body}
                                                        menuPosition="fixed"
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

            {activeTab === 'pending' && (
                <div className="ps-content">
                    <div className="ps-orders-table">
                        <h3 className="ps-section-title">Pending Orders</h3>
                        <div className="ps-search-bar">
                            <input
                                type="text"
                                placeholder="Search by Order #, Username, or Products..."
                                value={pendingSearchQuery}
                                onChange={(e) => setPendingSearchQuery(e.target.value)}
                                className="ps-search-input"
                            />
                            {pendingSearchQuery && (
                                <button 
                                    className="ps-clear-search"
                                    onClick={() => setPendingSearchQuery('')}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
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
                                {filterOrders(pendingOrders, pendingSearchQuery).length > 0 ? filterOrders(pendingOrders, pendingSearchQuery).map(order => (
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
                                                onChange={(selected) => handleUpdateOrderStatus(order.id, selected.value, fetchPendingOrders, order.status)}
                                                options={statusOptions}
                                                styles={selectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="no-orders">
                                            {pendingSearchQuery ? 'No pending orders match your search' : 'No pending orders found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'processing' && (
                <div className="ps-content">
                    <div className="ps-orders-table">
                        <h3 className="ps-section-title">Processing Orders</h3>
                        <div className="ps-search-bar">
                            <input
                                type="text"
                                placeholder="Search by Order #, Username, or Products..."
                                value={processingSearchQuery}
                                onChange={(e) => setProcessingSearchQuery(e.target.value)}
                                className="ps-search-input"
                            />
                            {processingSearchQuery && (
                                <button 
                                    className="ps-clear-search"
                                    onClick={() => setProcessingSearchQuery('')}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
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
                                {filterOrders(processingOrders, processingSearchQuery).length > 0 ? filterOrders(processingOrders, processingSearchQuery).map(order => (
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
                                                onChange={(selected) => handleUpdateOrderStatus(order.id, selected.value, fetchProcessingOrders, order.status)}
                                                options={statusOptions}
                                                styles={selectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="no-orders">
                                            {processingSearchQuery ? 'No processing orders match your search' : 'No processing orders found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'shipped' && (
                <div className="ps-content">
                    <div className="ps-orders-table">
                        <h3 className="ps-section-title">Shipped Orders</h3>
                        <div className="ps-search-bar">
                            <input
                                type="text"
                                placeholder="Search by Order #, Username, or Products..."
                                value={shippedSearchQuery}
                                onChange={(e) => setShippedSearchQuery(e.target.value)}
                                className="ps-search-input"
                            />
                            {shippedSearchQuery && (
                                <button 
                                    className="ps-clear-search"
                                    onClick={() => setShippedSearchQuery('')}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
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
                                {filterOrders(shippedOrders, shippedSearchQuery).length > 0 ? filterOrders(shippedOrders, shippedSearchQuery).map(order => (
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
                                                onChange={(selected) => handleUpdateOrderStatus(order.id, selected.value, fetchShippedOrders, order.status)}
                                                options={statusOptions}
                                                styles={selectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="no-orders">
                                            {shippedSearchQuery ? 'No shipped orders match your search' : 'No shipped orders found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'delivered' && (
                <div className="ps-content">
                    <div className="ps-orders-table">
                        <h3 className="ps-section-title">Delivered Orders</h3>
                        <div className="ps-search-bar">
                            <input
                                type="text"
                                placeholder="Search by Order #, Username, or Products..."
                                value={deliveredSearchQuery}
                                onChange={(e) => setDeliveredSearchQuery(e.target.value)}
                                className="ps-search-input"
                            />
                            {deliveredSearchQuery && (
                                <button 
                                    className="ps-clear-search"
                                    onClick={() => setDeliveredSearchQuery('')}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
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
                                {filterOrders(deliveredOrders, deliveredSearchQuery).length > 0 ? filterOrders(deliveredOrders, deliveredSearchQuery).map(order => (
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
                                                onChange={(selected) => handleUpdateOrderStatus(order.id, selected.value, fetchDeliveredOrders, order.status)}
                                                options={statusOptions}
                                                styles={selectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="no-orders">
                                            {deliveredSearchQuery ? 'No delivered orders match your search' : 'No delivered orders found'}
                                        </td>
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
                        <div className="ps-search-bar">
                            <input
                                type="text"
                                placeholder="Search by Order #, Username, or Products..."
                                value={cancelledSearchQuery}
                                onChange={(e) => setCancelledSearchQuery(e.target.value)}
                                className="ps-search-input"
                            />
                            {cancelledSearchQuery && (
                                <button 
                                    className="ps-clear-search"
                                    onClick={() => setCancelledSearchQuery('')}
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
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
                                {filterOrders(cancelledOrders, cancelledSearchQuery).length > 0 ? filterOrders(cancelledOrders, cancelledSearchQuery).map(order => (
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
                                                onChange={(selected) => handleUpdateOrderStatus(order.id, selected.value, fetchCancelledOrders, order.status)}
                                                options={statusOptions}
                                                styles={selectStyles}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="no-orders">
                                            {cancelledSearchQuery ? 'No cancelled orders match your search' : 'No cancelled orders found'}
                                        </td>
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

            {/* Order Status Confirmation Modal */}
            {confirmModal && (
                <div className="ps-modal-overlay" onClick={handleCancelStatusChange}>
                    <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ps-modal-header">
                            <h3>Confirm Status Change</h3>
                        </div>
                        <div className="ps-modal-body">
                            <p>{confirmModal.message}</p>
                        </div>
                        <div className="ps-modal-actions">
                            <button className="ps-btn ps-btn-cancel" onClick={handleCancelStatusChange}>
                                Cancel
                            </button>
                            <button className="ps-btn ps-btn-confirm" onClick={handleConfirmStatusChange}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
