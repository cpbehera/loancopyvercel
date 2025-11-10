import React, { useEffect, useState } from "react";
import "./Features.css";

const Features = () => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetch("https://loancopy-production.up.railway.app/api/features")
      .then((res) => res.json())
      .then((data) => setFeatures(data))
      .catch((err) => console.error("Error fetching features:", err));
  }, []);

  return (
    <div className="features-container">
      <section className="process-section-appx">
        <div className="container">
          <div className="section-header-appx">
            <div className="section-badge-appx">Why Choose Us 💎</div>
            <h2>
              Built for&nbsp;<span>Your Success</span>
            </h2>
            <p>We make lending simple, transparent, and tailored to you</p>
          </div>
          <div className="feature-cards">
            {features.map((feature) => (
              <div key={feature.id} className="process-step-appx">
                <img
                  src={`http://localhost:5000${feature.image}`}
                  alt={`Feature ${feature.id}`}
                  className="step-image-appx"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
