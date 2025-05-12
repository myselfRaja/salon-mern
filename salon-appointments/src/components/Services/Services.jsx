import React from "react";
import "./Services.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import hairCut from "../../assets/hair.jpg";
import facial from "../../assets/facial.jpg";
import manicure from "../../assets/mani.jpg";
import beard from "../../assets/be.jpg";

const services = [
  {
    id: 1,
    name: "Hair Cut",
    price: "₹500",
    description: "Professional haircut tailored to your style.",
    img: hairCut,
  },
  {
    id: 2,
    name: "Facial",
    price: "₹800",
    description: "Refresh and glow with our facial services.",
    img: facial,
  },
  {
    id: 3,
    name: "Manicure",
    price: "₹600",
    description: "Pamper your hands with a clean finish.",
    img: manicure,
  },
  {
    id: 4,
    name: "Beard Trim",
    price: "₹400",
    description: "Sharp beard styles and precision trims.",
    img: beard,
  },
];

function Services() {
  const navigate = useNavigate();

  const handleBookNow = (serviceName) => {
    navigate(`/book?service=${encodeURIComponent(serviceName)}`);
  };

  return (
    <div className="services-container">
      <motion.h2
        className="services-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Our Services
      </motion.h2>

      <div className="services-grid">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            className="service-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={service.img}
              alt={service.name}
              className="service-image"
            />
            <h3 className="service-name">{service.name}</h3>
            <p className="service-description">{service.description}</p>
            <p className="service-price">{service.price}</p>
            <button
              className="book-now-btn"
              onClick={() => handleBookNow(service.name)}
            >
              Book Now
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Services;
