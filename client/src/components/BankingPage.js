import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BankingPage.css';

const BankingPage = ({ 
  applicationId: propApplicationId, 
  loanData: propLoanData,
  onBack,
  onBankSelect 
}) => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state || {};
  const finalApplicationId = propApplicationId || locationState.applicationId;
  const finalLoanData = propLoanData || locationState.loanData;

  useEffect(() => {
    console.log("🔍 BankingPage Data Analysis:", {
      propApplicationId,
      propLoanData,
      locationApplicationId: locationState.applicationId,
      locationLoanData: locationState.loanData,
      finalApplicationId,
      finalLoanData
    });
  }, []);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      console.log('🔄 Fetching banks from backend...');
      const response = await fetch('https://loancopy-production.up.railway.app/api/banks');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Found ${data.length} banks:`, data);
      
      setBanks(data);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error fetching banks:', error);
      setLoading(false);
    }
  };

  const handleBankSelect = (bank) => {
    console.log("🏦 Bank selected:", bank.name);
    setSelectedBank(bank);
  };

  const confirmBankSelection = async () => {
    if (!selectedBank || !finalApplicationId) {
      alert('Please select a bank and ensure application ID is available');
      return;
    }

    console.log("🎯 DEMO MODE: Bank selection successful", {
      applicationId: finalApplicationId,
      bankId: selectedBank.id,
      bankName: selectedBank.name,
      timestamp: new Date().toISOString()
    });
    
    alert(`✅ ${selectedBank.name} selected successfully!\n\nYour loan will be disbursed within ${selectedBank.processing_time}.`);
    
    if (onBankSelect) {
      onBankSelect(selectedBank);
    } else {
      navigate('/application-success', {
        state: {
          applicationId: finalApplicationId,
          bankName: selectedBank.name,
          roiRange: `${selectedBank.roi_min}% - ${selectedBank.roi_max}%`,
          processingTime: selectedBank.processing_time,
          loanAmount: finalLoanData?.loanAmount
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="banking-page">
        <div className="banking-container">
          <div className="loading">Loading banks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="banking-page">
      <button className="banking-close-btn" onClick={onBack}>
        &times;
      </button>
      
      <div className="banking-container">
        <div className="banking-header">
          <h1>Select Your Bank</h1>
          <p>Choose your preferred bank for loan disbursement</p>
        </div>
        
        <div className="banking-main-content">
          {/* Debug Info */}
          <div style={{
            background: '#fff3cd', 
            padding: '10px', 
            margin: '0 0 20px 0', 
            borderRadius: '5px',
            border: '1px solid #ffeaa7',
            fontSize: '14px'
          }}>
            <strong>🔧 Debug Info:</strong> 
            App ID: {finalApplicationId || 'NOT FOUND'} | 
            Loan Amount: {finalLoanData?.loanAmount ? 
              (typeof finalLoanData.loanAmount === 'number' ? 
                `₹${finalLoanData.loanAmount.toLocaleString()}` : 
                finalLoanData.loanAmount
              ) : 
              'NOT FOUND'
            }
          </div>

          {/* Loan Summary */}
          <div className="loan-summary-card">
            <h3>Your Loan Summary</h3>
            <div className="summary-details">
              <div className="summary-item">
                <span>Application ID:</span>
                <span>{finalApplicationId || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <span>Loan Amount:</span>
                <span>
                  {finalLoanData?.loanAmount ? 
                    (typeof finalLoanData.loanAmount === 'number' ? 
                      `₹${finalLoanData.loanAmount.toLocaleString()}` : 
                      finalLoanData.loanAmount
                    ) : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="summary-item">
                <span>Loan Type:</span>
                <span>{finalLoanData?.loanType || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <span>Status:</span>
                <span className="approved">Approved 💹</span>
              </div>
            </div>
          </div>

          {/* Banks Table Section */}
          <div className="banks-section">
            <div className="banks-container">
              <h4>Available Banks ({banks.length})</h4>
              
              {banks.length === 0 ? (
                <div className="no-banks">
                  <p>No banks available at the moment. Please try again later.</p>
                </div>
              ) : (
                <div className="banks-table">
                  <div className="table-container">
                    {/* Table Header */}
                    <div className="table-header">
                      <div>Bank Name</div>
                      <div>Product</div>
                      <div>ROI</div>
                      <div>Max Amount</div>
                      <div>Action</div>
                    </div>
                    
                    {/* Table Rows */}
                    {banks.map((bank) => (
                      <div
                        key={bank.id}
                        className={`table-row ${selectedBank?.id === bank.id ? 'selected' : ''}`}
                        onClick={() => handleBankSelect(bank)}
                      >
                        {/* Bank Name Column */}
                        <div className="bank-name-cell">
                          <div className="bank-logo-table">
                            {bank.logo || '🏦'}
                          </div>
                          <div className="bank-name-table">
                            {bank.name}
                          </div>
                        </div>
                        
                        {/* Product Column */}
                        <div className="product-cell">
                          {finalLoanData?.loanType || 'Personal Loan'}
                        </div>
                        
                        {/* ROI Column */}
                        <div className="roi-cell">
                          {bank.roi_min}% - {bank.roi_max}%
                        </div>
                        
                        {/* Amount Column */}
                        <div className="amount-cell">
                          ₹{(bank.max_loan_amount || 5000000).toLocaleString()}
                        </div>
                        
                        {/* Action Column */}
                        <div>
                          <button 
                            className={`select-btn ${selectedBank?.id === bank.id ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBankSelect(bank);
                            }}
                          >
                            {selectedBank?.id === bank.id ? 'Selected ✓' : 'Select'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          {selectedBank && (
            <div className="action-section">
              <button className="confirm-btn" onClick={confirmBankSelection}>
                Confirm {selectedBank.name} for Loan Disbursement
              </button>
              <p style={{textAlign: 'center', marginTop: '10px', color: '#666'}}>
                Your loan will be processed within {selectedBank.processing_time}
              </p>
            </div>
          )}

          {/* Note */}
          <div className="note-section">
            <p>
              <strong>Note:</strong> Your loan will be disbursed within 24-48 hours after bank verification. 
              CIBIL check is already completed and approved. Application ID: <strong>{finalApplicationId}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankingPage;
