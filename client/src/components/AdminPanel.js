// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import './AdminPanel.css';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedAppId, setExpandedAppId] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
      fetchData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (token = null) => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('auth_token');
      
      const response = await fetch('https://loancopy-production.up.railway.app/api/loan-applications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.status === 401) {
        // Token expired, logout
        handleLogout();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
      
    } catch (err) {
      console.error('❌ Fetch error:', err);
      if (err.message.includes('401')) {
        handleLogout();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    fetchData();
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('https://loancopy-production.up.railway.app/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setIsAuthenticated(false);
      setUser(null);
      setData([]);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`https://loancopy-production.up.railway.app/api/loan-applications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchData();
      
    } catch (err) {
      console.error('❌ Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  const toggleApplicationDetails = (appId) => {
    if (expandedAppId === appId) {
      setExpandedAppId(null);
    } else {
      setExpandedAppId(appId);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Filter data based on selected status
  const filteredData = selectedStatus === 'all' 
    ? data 
    : data.filter(app => app.status === selectedStatus);

  // Stats calculations
  const stats = {
    total: data.length,
    pending: data.filter(app => app.status === 'pending').length,
    approved: data.filter(app => app.status === 'approved').length,
    rejected: data.filter(app => app.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-main">
          <div className="loading-state">
            <div className="loading-content">
              <h2>🔄 Loading Dashboard...</h2>
              <p>Fetching data from backend...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="admin-main">
          <div className="error-state">
            <div className="error-content">
              <h2>❌ Error Loading Data</h2>
              <p><strong>Error:</strong> {error}</p>
              <button 
                onClick={fetchData}
                className="refresh-btn"
                style={{ marginTop: '15px' }}
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h1>🏦 FinTrust Admin</h1>
          <p>Welcome, {user?.phone_number}</p>
        </div>
        
        <div className="sidebar-menu">
          <div 
            className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <span className="menu-icon">📊</span>
            Dashboard
          </div>
          <div 
            className={`menu-item ${activeMenu === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveMenu('applications')}
          >
            <span className="menu-icon">📋</span>
            Loan Applications
          </div>
          <div 
            className={`menu-item ${activeMenu === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveMenu('payments')}
          >
            <span className="menu-icon">💰</span>
            Payments
          </div>
          <div 
            className={`menu-item ${activeMenu === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveMenu('reports')}
          >
            <span className="menu-icon">📈</span>
            Reports
          </div>
          <div 
            className={`menu-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('settings')}
          >
            <span className="menu-icon">⚙️</span>
            Settings
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <div className="header-title">
            <h1>Loan Applications Dashboard</h1>
            <p>Manage and monitor all loan applications in real-time</p>
          </div>
          <div className="header-actions">
            <button onClick={fetchData} className="refresh-btn">
              🔄 Refresh Data
            </button>
            <div className="user-profile">
              <div className="user-avatar">
                {user?.phone_number?.slice(-2)}
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>Admin</div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                  {user?.phone_number}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>TOTAL APPLICATIONS</h3>
                <p className="stat-value">{stats.total}</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>PENDING REVIEW</h3>
                <p className="stat-value">{stats.pending}</p>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>APPROVED</h3>
                <p className="stat-value">{stats.approved}</p>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>REJECTED</h3>
                <p className="stat-value">{stats.rejected}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="controls-section">
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Applications ({stats.total})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="approved">Approved ({stats.approved})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
              </select>
            </div>
            <div className="payment-info">
              <h4>💰 Payment UPI ID</h4>
              <div className="upi-id">fintrust.loan@okicici</div>
            </div>
          </div>

          {/* Applications List */}
          <div className="applications-section">
            <div className="section-header">
              <h2>
                📋 Loan Applications
                <span className="app-count">{filteredData.length}</span>
              </h2>
            </div>
            
            <div className="applications-list">
              {filteredData.length === 0 ? (
                <div className="empty-state">
                  <h3>📭 No applications found</h3>
                  <p>There are no loan applications matching your current filter.</p>
                </div>
              ) : (
                filteredData.map((app) => {
                  const appData = app.application_data || {};
                  const isExpanded = expandedAppId === app.id;
                  
                  return (
                    <div key={app.id} className={`application-card ${isExpanded ? 'expanded' : ''}`}>
                      {/* Basic Info - Always Visible */}
                      <div className="app-header" onClick={() => toggleApplicationDetails(app.id)}>
                        <div className="app-basic-info">
                          <h3>
                            👤 {appData.fullName || 'N/A'}
                            <span className="app-id">#{app.id}</span>
                          </h3>
                          <div className="app-meta">
                            <span>💰 {formatCurrency(appData.loanAmount)}</span>
                            <span>🏠 {app.loan_type || 'Personal'} Loan</span>
                            <span>📅 {formatDate(app.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="app-actions">
                          <span className={`status-badge ${app.status || 'pending'}`}>
                            {app.status || 'pending'}
                          </span>
                          <button className="expand-btn">
                            {isExpanded ? '▲ Hide' : '▼ Show'} Details
                          </button>
                        </div>
                      </div>

                      {/* Detailed Information - Expandable */}
                      {isExpanded && (
                        <div className="app-details">
                          <div className="details-section">
                            <h4>👤 Personal Information</h4>
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Full Name:</span>
                                <span className="detail-value">{appData.fullName || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{appData.email || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Phone:</span>
                                <span className="detail-value">{appData.phone || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Applied On:</span>
                                <span className="detail-value">{formatDate(app.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="details-section">
                            <h4>💰 Loan Information</h4>
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Loan Type:</span>
                                <span className="detail-value">{app.loan_type || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Requested Amount:</span>
                                <span className="detail-value">{formatCurrency(appData.loanAmount)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Approved Amount:</span>
                                <span className="detail-value">{formatCurrency(app.approved_amount)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">CIBIL Score:</span>
                                <span className="detail-value">{appData.cibilScore || app.cibil_score || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="details-section">
                            <h4>💼 Income & Employment</h4>
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Employment Status:</span>
                                <span className="detail-value">{appData.employmentStatus || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Monthly Income:</span>
                                <span className="detail-value">{formatCurrency(appData.monthlyIncome || appData.annualIncome)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Company/Business:</span>
                                <span className="detail-value">{appData.companyName || appData.businessName || 'N/A'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Income Type:</span>
                                <span className="detail-value">{appData.incomeType || appData.businessType || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bank Information */}
                          {app.bank_selected && (
                            <div className="details-section bank-info">
                              <h4>🏦 Bank Selection</h4>
                              <div className="details-grid">
                                <div className="detail-item">
                                  <span className="detail-label">Selected Bank:</span>
                                  <span className="detail-value">{app.bank_selected}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">ROI Range:</span>
                                  <span className="detail-value">{app.roi_range || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Processing Time:</span>
                                  <span className="detail-value">{app.processing_time || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Bank ID:</span>
                                  <span className="detail-value">{app.bank_id || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Payment Information */}
                          <div className="details-section payment-info">
                            <h4>💳 Payment Status</h4>
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Platform Fee Paid:</span>
                                <span className="detail-value">
                                  {app.platform_fee_paid ? (
                                    <span style={{color: '#27ae60', fontWeight: 'bold'}}>✅ Yes</span>
                                  ) : (
                                    <span style={{color: '#e74c3c', fontWeight: 'bold'}}>❌ No</span>
                                  )}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Payment Status:</span>
                                <span className="detail-value">{app.payment_status || 'pending'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">UPI ID:</span>
                                <span className="detail-value upi-code">fintrust.loan@okicici</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Update Section */}
                          <div className="status-update-section">
                            <h4>🔄 Update Application Status</h4>
                            <div className="status-actions">
                              <select 
                                value={app.status || 'pending'} 
                                onChange={(e) => updateStatus(app.id, e.target.value)}
                                className="status-select"
                              >
                                <option value="pending">⏳ Pending</option>
                                <option value="approved">✅ Approved</option>
                                <option value="rejected">❌ Rejected</option>
                              </select>
                              <button 
                                onClick={() => toggleApplicationDetails(app.id)}
                                className="close-btn"
                              >
                                Close Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
