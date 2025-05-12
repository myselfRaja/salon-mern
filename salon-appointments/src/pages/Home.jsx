import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import heroImage1 from "../assets/hero.jpg";
import heroImage2 from "../assets/hero2.jpg";
import heroImage3 from "../assets/hero3.jpg";

function Home() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/book"); // navigate to appointment page
  };

  return (
    <div className="hero">
      <div className="overlay">
        <h1 className="fade-in">Welcome to Salon Luxe</h1>
        <p className="slide-in">Experience the best beauty & grooming services</p>
        <button className="glow-btn" onClick={handleNavigate}>
          Book an Appointment
        </button>
      </div>
    </div>
  );
}

export default Home;
