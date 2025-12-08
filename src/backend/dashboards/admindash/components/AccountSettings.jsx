import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Notification from '../../../../components/Notification';
import './styles/AccountSettings.css';

export default function AccountSettings() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [deletedUsers, setDeletedUsers] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const roleOptions = [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
    ];

    const regions = [
        'Asia',
        'Europe',
        'North America',
        'South America',
        'Africa',
        'Oceania',
        'Antarctica'
    ];

    const regionOptions = regions.map(region => ({ value: region, label: region }));

    const countryCodes = [
        { code: "+63", flag: "🇵🇭", country: "PH", maxLength: 10 },
        { code: "+1", flag: "🇺🇸", country: "US", maxLength: 10 },
        { code: "+1", flag: "🇨🇦", country: "CA", maxLength: 10 },
        { code: "+44", flag: "🇬🇧", country: "UK", maxLength: 10 },
        { code: "+61", flag: "🇦🇺", country: "AU", maxLength: 9 },
        { code: "+81", flag: "🇯🇵", country: "JP", maxLength: 10 },
        { code: "+82", flag: "🇰🇷", country: "KR", maxLength: 10 },
        { code: "+86", flag: "🇨🇳", country: "CN", maxLength: 11 },
        { code: "+91", flag: "🇮🇳", country: "IN", maxLength: 10 },
        { code: "+49", flag: "🇩🇪", country: "DE", maxLength: 11 },
        { code: "+33", flag: "🇫🇷", country: "FR", maxLength: 9 },
        { code: "+39", flag: "🇮🇹", country: "IT", maxLength: 10 },
        { code: "+34", flag: "🇪🇸", country: "ES", maxLength: 9 },
        { code: "+7", flag: "🇷🇺", country: "RU", maxLength: 10 },
        { code: "+55", flag: "🇧🇷", country: "BR", maxLength: 11 },
        { code: "+52", flag: "🇲🇽", country: "MX", maxLength: 10 },
    ];

    const countryCodeOptions = countryCodes.map(country => ({
        value: country.code,
        label: `${country.flag} ${country.country} ${country.code}`,
        maxLength: country.maxLength
    }));

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                // Map database snake_case to camelCase for React
                const mappedUsers = (data.users || []).map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    contactNumber: user.contact_number,
                    role: user.role,
                    isActive: user.is_active
                }));
                setUsers(mappedUsers);
            } else {
                setNotification({ message: 'Failed to load users', type: 'error' });
            }

            // Fetch deleted users
            const deletedRes = await fetch('/api/admin/users/deleted', { credentials: 'include' });
            if (deletedRes.ok) {
                const deletedData = await deletedRes.json();
                console.log('Deleted users response:', deletedData);
                const mappedDeleted = (deletedData.users || []).map(user => ({
                    id: user.original_id,
                    username: user.username,
                    email: user.email,
                    contactNumber: user.contact_number,
                    role: user.role,
                    deletedAt: user.deleted_at
                }));
                console.log('Mapped deleted users:', mappedDeleted);
                setDeletedUsers(mappedDeleted);
            } else {
                console.error('Failed to fetch deleted users, status:', deletedRes.status);
            }
        } catch (err) {
            console.error('Fetch users error:', err);
            setNotification({ message: 'Network error loading users', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (userId) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setEditingUser(data.user);
                // Map database fields to form fields
                setFormData({
                    firstName: data.user.first_name || '',
                    middleInitial: data.user.middle_initial || '',
                    lastName: data.user.last_name || '',
                    username: data.user.username || '',
                    email: data.user.email || '',
                    contactNumber: data.user.contact_number || '',
                    countryCode: data.user.country_code || '',
                    region: data.user.region || '',
                    country: data.user.country || '',
                    city: data.user.city || '',
                    address: data.user.street_address || '',
                    postalCode: data.user.postal_code || '',
                    role: data.user.role || 'User'
                });
                setShowEditModal(true);
            } else {
                setNotification({ message: 'Failed to load user details', type: 'error' });
            }
        } catch (err) {
            console.error('Load user error:', err);
            setNotification({ message: 'Network error', type: 'error' });
        }
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setNotification({ message: 'User updated successfully', type: 'success' });
                setShowEditModal(false);
                setEditingUser(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setNotification({ message: data.error || 'Failed to update user', type: 'error' });
            }
        } catch (err) {
            console.error('Update user error:', err);
            setNotification({ message: 'Network error', type: 'error' });
        }
    };

    const handleDelete = (userId, username) => {
        setConfirmAction({
            type: 'delete',
            userId,
            username,
            message: `Are you sure you want to delete user "${username}"? This will move them to the deleted users table.`,
            confirmText: 'Delete',
            action: async () => {
                try {
                    const res = await fetch(`/api/admin/users/${userId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });

                    if (res.ok) {
                        setNotification({ message: 'User deleted successfully', type: 'success' });
                        fetchUsers();
                    } else {
                        const data = await res.json();
                        setNotification({ message: data.error || 'Failed to delete user', type: 'error' });
                    }
                } catch (err) {
                    console.error('Delete user error:', err);
                    setNotification({ message: 'Network error', type: 'error' });
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleDeactivate = (userId, username, currentStatus) => {
        const action = currentStatus === 1 ? 'deactivate' : 'activate';
        setConfirmAction({
            type: action,
            userId,
            username,
            message: `Are you sure you want to ${action} user "${username}"?`,
            confirmText: action === 'deactivate' ? 'Deactivate' : 'Activate',
            action: async () => {
                try {
                    const res = await fetch(`/api/admin/users/${userId}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ isActive: currentStatus === 1 ? 0 : 1 })
                    });

                    if (res.ok) {
                        setNotification({ message: `User ${action}d successfully`, type: 'success' });
                        fetchUsers();
                    } else {
                        const data = await res.json();
                        setNotification({ message: data.error || `Failed to ${action} user`, type: 'error' });
                    }
                } catch (err) {
                    console.error('Deactivate user error:', err);
                    setNotification({ message: 'Network error', type: 'error' });
                }
            }
        });
        setShowConfirmModal(true);
    };

    const handleAddUser = () => {
        setFormData({
            firstName: '',
            middleInitial: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            contactNumber: '',
            countryCode: '+63',
            region: '',
            country: '',
            city: '',
            address: '',
            postalCode: '',
            role: 'user'
        });
        setShowAddModal(true);
    };

    const handleSaveNewUser = async () => {
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.username || 
            !formData.email || !formData.password) {
            setNotification({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setNotification({ message: 'User created successfully', type: 'success' });
                setShowAddModal(false);
                fetchUsers();
            } else {
                const data = await res.json();
                setNotification({ message: data.message || 'Failed to create user', type: 'error' });
            }
        } catch (err) {
            console.error('Create user error:', err);
            setNotification({ message: 'Network error', type: 'error' });
        }
    };

    const handleFormChange = (field, value) => {
        // Handle contact number input - only allow digits
        if (field === 'contactNumber') {
            const digitsOnly = value.replace(/\D/g, '');
            const selectedCountry = countryCodeOptions.find(c => c.value === formData.countryCode);
            const maxLength = selectedCountry ? selectedCountry.maxLength : 15;
            
            setFormData(prev => ({
                ...prev,
                [field]: digitsOnly.slice(0, maxLength)
            }));
            return;
        }
        
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRoleChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, role: selectedOption ? selectedOption.value : 'user' }));
    };

    const handleCountryCodeChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            countryCode: selectedOption ? selectedOption.value : '+63'
        }));
    };

    const handleRegionChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            region: selectedOption ? selectedOption.value : ''
        }));
    };

    // Filter users based on active tab and search query
    const getFilteredUsers = () => {
        let filtered = [];
        
        if (activeTab === 'active') {
            filtered = users.filter(user => user.isActive);
        } else if (activeTab === 'deactivated') {
            filtered = users.filter(user => !user.isActive);
        } else if (activeTab === 'deleted') {
            filtered = deletedUsers;
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user => 
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.contactNumber && user.contactNumber.includes(query))
            );
        }

        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    if (loading) {
        return <div className="account-settings-loading">Loading users...</div>;
    }

    return (
        <div className="account-settings">
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="account-settings-header">
                <div>
                    <h2>Account Settings - User Management</h2>
                    <p>Manage all user accounts in the system</p>
                </div>
                <button className="btn-add-user" onClick={handleAddUser}>
                    Add User
                </button>
            </div>

            {/* Tabs for filtering users */}
            <div className="user-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Users ({users.filter(u => u.isActive).length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'deactivated' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deactivated')}
                >
                    Deactivated ({users.filter(u => !u.isActive).length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'deleted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deleted')}
                >
                    Deleted ({deletedUsers.length})
                </button>
            </div>

            {/* Search bar */}
            <div className="user-search-bar">
                <input
                    type="text"
                    placeholder="Search by username, email, or contact number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                {searchQuery && (
                    <button 
                        className="clear-search-btn"
                        onClick={() => setSearchQuery('')}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Contact Number</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-users">
                                    {searchQuery ? 'No users match your search' : 'No users found'}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.contactNumber || 'N/A'}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {activeTab === 'deleted' ? (
                                            <span className="status-badge status-deleted">
                                                Deleted
                                            </span>
                                        ) : (
                                            <span className={`status-badge status-${user.isActive ? 'active' : 'inactive'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        {activeTab !== 'deleted' ? (
                                            <>
                                                <button 
                                                    className="action-btn edit-btn"
                                                    onClick={() => handleEdit(user.id)}
                                                    title="Edit user"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="action-btn deactivate-btn"
                                                    onClick={() => handleDeactivate(user.id, user.username, user.isActive)}
                                                    title={user.isActive ? "Deactivate user" : "Activate user"}
                                                >
                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button 
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDelete(user.id, user.username)}
                                                    title="Delete user"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <span className="deleted-info">
                                                Deleted on {new Date(user.deletedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingUser && (
                <div className="edit-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="edit-modal-header">
                            <h3>Edit User - {editingUser.username}</h3>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        </div>

                        <div className="edit-modal-body">
                            {/* Personal Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Personal Information</div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.firstName || ''} 
                                            onChange={(e) => handleFormChange('firstName', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Middle Initial</label>
                                        <input 
                                            type="text" 
                                            maxLength="1"
                                            value={formData.middleInitial || ''} 
                                            onChange={(e) => handleFormChange('middleInitial', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.lastName || ''} 
                                            onChange={(e) => handleFormChange('lastName', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Account Information</div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input 
                                            type="text" 
                                            value={formData.username || ''} 
                                            onChange={(e) => handleFormChange('username', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input 
                                            type="email" 
                                            value={formData.email || ''} 
                                            onChange={(e) => handleFormChange('email', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <Select
                                            value={roleOptions.find(option => option.value === formData.role) || roleOptions[0]}
                                            onChange={handleRoleChange}
                                            options={roleOptions}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select Role"
                                            isSearchable={false}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Contact Information</div>
                                <div className="form-group-full">
                                    <label>Contact Number</label>
                                    <div className="phone-input-wrapper">
                                        <Select
                                            value={countryCodeOptions.find(option => option.value === formData.countryCode)}
                                            onChange={handleCountryCodeChange}
                                            options={countryCodeOptions}
                                            className="react-select-container phone-country-select-react"
                                            classNamePrefix="react-select"
                                            isSearchable={false}
                                        />
                                        <input
                                            type="tel"
                                            value={formData.contactNumber || ''}
                                            onChange={(e) => handleFormChange('contactNumber', e.target.value)}
                                            className="phone-number-input"
                                            placeholder="Enter number"
                                            maxLength={countryCodeOptions.find(c => c.value === formData.countryCode)?.maxLength || 15}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Address Information</div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Region</label>
                                        <Select
                                            value={regionOptions.find(option => option.value === formData.region)}
                                            onChange={handleRegionChange}
                                            options={regionOptions}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select Region"
                                            isClearable
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input 
                                            type="text" 
                                            value={formData.country || ''} 
                                            onChange={(e) => handleFormChange('country', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input 
                                            type="text" 
                                            value={formData.city || ''} 
                                            onChange={(e) => handleFormChange('city', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group-full">
                                    <label>Street Address</label>
                                    <textarea 
                                        rows="2"
                                        value={formData.address || ''} 
                                        onChange={(e) => handleFormChange('address', e.target.value)}
                                        placeholder="Enter complete street address"
                                    />
                                </div>

                                <div className="form-row form-row-2">
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input 
                                            type="text" 
                                            value={formData.postalCode || ''} 
                                            onChange={(e) => handleFormChange('postalCode', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="edit-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleSaveEdit}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="edit-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="edit-modal-header">
                            <h3>Add New User</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                        </div>

                        <div className="edit-modal-body">
                            {/* Personal Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Personal Information</div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input 
                                            type="text" 
                                            value={formData.firstName || ''} 
                                            onChange={(e) => handleFormChange('firstName', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Middle Initial</label>
                                        <input 
                                            type="text" 
                                            maxLength="1"
                                            value={formData.middleInitial || ''} 
                                            onChange={(e) => handleFormChange('middleInitial', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input 
                                            type="text" 
                                            value={formData.lastName || ''} 
                                            onChange={(e) => handleFormChange('lastName', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Account Information</div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Username *</label>
                                        <input 
                                            type="text" 
                                            value={formData.username || ''} 
                                            onChange={(e) => handleFormChange('username', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input 
                                            type="email" 
                                            value={formData.email || ''} 
                                            onChange={(e) => handleFormChange('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password *</label>
                                        <div className="password-input-wrapper">
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password || ''} 
                                                onChange={(e) => handleFormChange('password', e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? '👁️' : '👁️‍🗨️'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-row form-row-2">
                                    <div className="form-group">
                                        <label>Role</label>
                                        <Select
                                            value={roleOptions.find(option => option.value === formData.role) || roleOptions[0]}
                                            onChange={handleRoleChange}
                                            options={roleOptions}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select Role"
                                            isSearchable={false}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Contact Information</div>
                                <div className="form-group-full">
                                    <label>Contact Number</label>
                                    <div className="phone-input-wrapper">
                                        <Select
                                            value={countryCodeOptions.find(option => option.value === formData.countryCode)}
                                            onChange={handleCountryCodeChange}
                                            options={countryCodeOptions}
                                            className="react-select-container phone-country-select-react"
                                            classNamePrefix="react-select"
                                            isSearchable={false}
                                        />
                                        <input
                                            type="tel"
                                            value={formData.contactNumber || ''}
                                            onChange={(e) => handleFormChange('contactNumber', e.target.value)}
                                            className="phone-number-input"
                                            placeholder="Enter number"
                                            maxLength={countryCodeOptions.find(c => c.value === formData.countryCode)?.maxLength || 15}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information Section */}
                            <div className="form-section">
                                <div className="form-section-title">Address Information</div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Region</label>
                                        <Select
                                            value={regionOptions.find(option => option.value === formData.region)}
                                            onChange={handleRegionChange}
                                            options={regionOptions}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select Region"
                                            isClearable
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input 
                                            type="text" 
                                            value={formData.country || ''} 
                                            onChange={(e) => handleFormChange('country', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input 
                                            type="text" 
                                            value={formData.city || ''} 
                                            onChange={(e) => handleFormChange('city', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group-full">
                                    <label>Street Address</label>
                                    <textarea 
                                        rows="2"
                                        value={formData.address || ''} 
                                        onChange={(e) => handleFormChange('address', e.target.value)}
                                        placeholder="Enter complete street address"
                                    />
                                </div>

                                <div className="form-row form-row-2">
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input 
                                            type="text" 
                                            value={formData.postalCode || ''} 
                                            onChange={(e) => handleFormChange('postalCode', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="edit-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleSaveNewUser}>
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && confirmAction && (
                <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-header">
                            <h3>Confirm Action</h3>
                        </div>
                        <div className="confirm-modal-body">
                            <p>{confirmAction.message}</p>
                        </div>
                        <div className="confirm-modal-footer">
                            <button 
                                className="btn-cancel" 
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className={`btn-confirm ${confirmAction.type === 'delete' ? 'btn-danger' : 'btn-warning'}`}
                                onClick={() => {
                                    confirmAction.action();
                                    setShowConfirmModal(false);
                                }}
                            >
                                {confirmAction.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
