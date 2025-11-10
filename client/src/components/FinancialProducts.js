import React, { useState, useEffect } from "react";
import {
  FaArrowRight,
  FaClock,
  FaPercent,
  FaMoneyBillWave,
  FaShieldAlt,
  FaTimes,
} from "react-icons/fa";
import "./FinancialProducts.css";

// Import your images
import personalLoanImage from "../assets/images/personal-loan.jpg";
import homeLoanImage from "../assets/images/home-loan.jpg";
import businessLoanImage from "../assets/images/business-loan.jpg";
import mortageLoanImage from "../assets/images/mortage-loan.png";
import odLoanImage from "../assets/images/od-loan.jpg";
import ccLoanImage from "../assets/images/cc-loan.jpg";

// Import the actual LoanForm component
import LoanForm from "./LoanForm"; // Adjust the path as needed

// Fallback images
const fallbackImages = {
  "Personal Loan": "https://via.placeholder.com/100/667eea/ffffff?text=PL",
  "Home Loan": "https://via.placeholder.com/100/f093fb/ffffff?text=HL",
  "Business Loan": "https://via.placeholder.com/100/43e97b/ffffff?text=BL",
  "Mortage Loan": "https://via.placeholder.com/100/4facfe/ffffff?text=ML",
  "OD Loan": "https://via.placeholder.com/100/fa709a/ffffff?text=OD",
  "CC Limit Loan": "https://via.placeholder.com/100/667eea/ffffff?text=CC",
};

const FinancialProducts = ({ onApplyClick }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [loanProducts, setLoanProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLoanForm, setShowLoanForm] = useState(false);

  // Fetch loan products from backend
  useEffect(() => {
    fetch("https://loancopy-production.up.railway.app/api/loan-products")
      .then((res) => res.json())
      .then((data) => setLoanProducts(data))
      .catch((err) => {
        console.error("Error fetching loan products:", err);
        setLoanProducts([]);
      });
  }, []);

  const getProductImage = (product) => {
    const imageMap = {
      "Personal Loan": personalLoanImage,
      "Home Loan": homeLoanImage,
      "Business Loan": businessLoanImage,
      "Mortage Loan": mortageLoanImage,
      "OD Loan": odLoanImage,
      "CC Limit Loan": ccLoanImage,
    };

    if (imageErrors[product.name]) {
      return fallbackImages[product.name] || fallbackImages["Personal Loan"];
    }

    return (
      imageMap[product.name] ||
      fallbackImages[product.name] ||
      fallbackImages["Personal Loan"]
    );
  };

  const handleImageError = (productName) => {
    setImageErrors((prev) => ({ ...prev, [productName]: true }));
  };

  const handleApplyNow = (product) => {
    setSelectedProduct(product);
    setShowLoanForm(true);
  };

  const handleCloseLoanForm = () => {
    setShowLoanForm(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <section className="financial-products-modern">
        <div className="container">
          <div className="section-header-modern">
            <div className="section-badge">Our Products ✨</div>
            <h2>
              Loans for Every&nbsp;<span>Dream</span>
            </h2>
            <p>
              Choose from our wide range of loan products tailored to your needs
            </p>
          </div>

          <div className="products-grid-modern">
            {loanProducts.map((product, index) => (
              <div
                key={product.id}
                className={`product-card-modern ${
                  hoveredCard === product.id ? "hovered" : ""
                }`}
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card Content */}
                <div className="card-content-modern">
                  <div className="product-image-container">
                    <div className="image-background">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="product-image"
                        onError={() => handleImageError(product.name)}
                      />
                    </div>
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">
                      {product.description}
                    </p>
                  </div>

                  {/* Loan Details Section */}
                  <div className="loan-details-modern">
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaPercent className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Interest Rate</span>
                          <span className="detail-value">
                            {product.interest_rate}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Tenure</span>
                          <span className="detail-value">
                            {product.tenure}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaMoneyBillWave className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Processing Time</span>
                          <span className="detail-value">
                            {product.processing_time}
                          </span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaShieldAlt className="detail-icon" />
                        <div className="detail-content">
                          <span className="detail-label">Security</span>
                          <span className="detail-value">
                            {product.security_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="card-actions-modern">
                  <button
                    className="btn-primary-modern"
                    onClick={() => handleApplyNow(product)}
                  >
                    <span>Apply Now</span>
                    <FaArrowRight className="arrow-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Form Popup */}
      {showLoanForm && (
        <div className="loan-form-popup-overlay">
          <div className="loan-form-popup-container">
            <button className="popup-close-btn" onClick={handleCloseLoanForm}>
              <FaTimes />
            </button>
            
            <div className="loan-form-popup-content">
              <LoanForm 
                preSelectedLoanType={selectedProduct?.name}
                onClose={handleCloseLoanForm}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinancialProducts;
