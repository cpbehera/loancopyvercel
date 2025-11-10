import React, { useEffect, useState } from "react";
import { FaArrowRight, FaStar, FaUsers } from "react-icons/fa";
import "./FinancialServices.css";

const LoanServices = ({ onApplyClick }) => {
  const [loanServices, setLoanServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchLoanServices = async () => {
      try {
        const response = await fetch("https://loancopy-production.up.railway.app/api/loan-services");
        if (!response.ok) throw new Error("Failed to fetch loan services");
        const data = await response.json();
        setLoanServices(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLoanServices();
  }, []);

  if (loading) return <p>Loading loan services...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <section className="financial-services-modern">
      <div className="container">
        <div className="section-header-modern">
          <div className="section-badge">Our Services ✨</div>
          <h2>
            Professional&nbsp;<span>Loan Services</span>
          </h2>
          <p>
            Choose from our wide range of financial services tailored to your
            business and personal needs
          </p>
        </div>

        <div className="services-grid-modern">
          {loanServices.map((service, index) => (
            <div
              key={service.id}
              className={`service-card-modern ${
                hoveredCard === service.id ? "hovered" : ""
              }`}
              onMouseEnter={() => setHoveredCard(service.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card-content-modern">
                <div className="service-image-container">
                  <img
                    src={`http://localhost:5000${service.image}`}
                    alt={service.name}
                    className="service-image"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/100/cccccc?text=No+Image")
                    }
                  />
                </div>

                <div className="service-info">
                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                </div>

                <div className="pricing-section">
                  <div className="service-stats">
                    <div className="stat-item">
                      <FaStar className="stat-icon" />
                      <span>4.9/5 Rating</span>
                    </div>
                    <div className="stat-item">
                      <FaUsers className="stat-icon" />
                      <span>20K+ Happy Clients</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions-modern">
                <button
                  className="btn-primary-modern"
                  onClick={() => onApplyClick(service)}
                >
                  <span>Get Service</span>
                  <FaArrowRight className="arrow-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoanServices;
