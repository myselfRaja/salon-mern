// src/components/Common/Loader.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // agar already project me add nahi kiya hai
import "./Loader.css";

const Loader = ({ message }) => {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        {/* Bootstrap spinner */}
        <div className="spinner-border text-success" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
};

export default Loader;
