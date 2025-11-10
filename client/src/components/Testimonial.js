import React, { useState, useEffect } from "react";
import {
  FaQuoteLeft,
  FaStar,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./Testimonial.css";

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto slide configuration
  const slidesToShow = 3;

  // Fetch testimonials from backend
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://loancopy-production.up.railway.app/api/testimonials");
        
        if (!response.ok) {
          throw new Error("Failed to fetch testimonials");
        }
        
        const data = await response.json();
        setTestimonials(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Failed to load testimonials. Please try again later.");
        // You can set default testimonials here as fallback
        setTestimonials(getDefaultTestimonials());
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Fallback default testimonials in case of error
  const getDefaultTestimonials = () => [
    {
      name: "Rahul Sharma",
      role: "Business Owner",
      location: "Mumbai",
      content: "FinTrust helped me expand my business with a timely loan. The process was smooth and the interest rates were very competitive. Highly recommended!",
      rating: 5,
      bgColor: "card-bg-1",
      borderColor: "card-border-1",
    },
    {
      name: "Priya Patel",
      role: "Home Buyer",
      location: "Delhi",
      content: "Got my home loan approved in just 3 days! The team was very supportive throughout the process. Made my dream of owning a home come true.",
      rating: 5,
      bgColor: "card-bg-2",
      borderColor: "card-border-2",
    }
  ];

  const totalSlides = testimonials.length;

  const nextSlide = () => {
    if (totalSlides <= slidesToShow) return;
    setCurrentSlide((prev) => (prev + 1) % (totalSlides - slidesToShow + 1));
  };

  const prevSlide = () => {
    if (totalSlides <= slidesToShow) return;
    setCurrentSlide(
      (prev) =>
        (prev - 1 + (totalSlides - slidesToShow + 1)) %
        (totalSlides - slidesToShow + 1)
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto slide effect
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= slidesToShow) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying, testimonials.length]);

  // Show loading state
  if (loading) {
    return (
      <section className="testimonials-appx">
        <div className="container">
          <div className="section-header-appx">
            <div className="section-badge-appx">✨ Customer Stories</div>
            <h2>What Our Customers <span>Say</span></h2>
            <p>Real stories from real people who achieved their dreams with us 💭</p>
          </div>
          <div className="loading-state">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error && testimonials.length === 0) {
    return (
      <section className="testimonials-appx">
        <div className="container">
          <div className="section-header-appx">
            <div className="section-badge-appx">✨ Customer Stories</div>
            <h2>What Our Customers <span>Say</span></h2>
            <p>Real stories from real people who achieved their dreams with us 💭</p>
          </div>
          <div className="error-state">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials-appx">
      <div className="container">
        <div className="section-header-appx">
          <div className="section-badge-appx">✨ Customer Stories</div>
          <h2>
            What Our Customers <span>Say</span>
          </h2>
          <p>
            Real stories from real people who achieved their dreams with us 💭
          </p>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Slider Container */}
        <div className="testimonial-slider-container">
          {/* Navigation Buttons - Only show if we have more slides than visible */}
          {testimonials.length > slidesToShow && (
            <>
              <button
                className="slider-nav-btn slider-prev"
                onClick={prevSlide}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <FaChevronLeft />
              </button>

              <button
                className="slider-nav-btn slider-next"
                onClick={nextSlide}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Slider Track */}
          <div
            className="testimonials-slider-track"
            style={{
              transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id || index} className="testimonial-slide">
                <div
                  className={`testimonial-card-appx ${testimonial.bgColor} ${testimonial.borderColor}`}
                >
                  {/* Quote Icon */}
                  <div className="quote-icon-appx">
                    <FaQuoteLeft />
                  </div>

                  {/* Testimonial Content */}
                  <div className="testimonial-content-appx">
                    <div className="rating-appx">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < testimonial.rating
                              ? "star-filled"
                              : "star-empty"
                          }
                        />
                      ))}
                    </div>
                    <p>"{testimonial.content}"</p>
                  </div>

                  {/* Client Info */}
                  <div className="client-info-appx">
                    <div className="client-avatar-appx">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="client-details-appx">
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                      <div className="client-location-appx">
                        <FaMapMarkerAlt className="location-icon" />
                        <span>{testimonial.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Background Gradient */}
                  <div className="testimonial-gradient-appx"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator - Only show if we have more slides than visible */}
        {testimonials.length > slidesToShow && (
          <div className="slider-dots">
            {[...Array(totalSlides - slidesToShow + 1)].map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(index)}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              />
            ))}
          </div>
        )}

        {/* Stats Bar */}
        <div className="testimonials-stats-appx">
          <div className="stat-item-appx">
            <div>
              <span>⭐</span>
            </div>
            <div>
              <div className="stat-number-appx">Rated</div>
              <div className="stat-label-appx">4.9/5.0</div>
            </div>
          </div>
          <div className="stat-item-appx">
            <div>
              <span>🏆</span>
            </div>
            <div>
              <div className="stat-number-appx">Awards</div>
              <div className="stat-label-appx">Best Lender 2024</div>
            </div>
          </div>
          <div className="stat-item-appx">
            <div>
              <span>✅</span>
            </div>
            <div>
              <div className="stat-number-appx">Verified</div>
              <div className="stat-label-appx">Trustpilot</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
