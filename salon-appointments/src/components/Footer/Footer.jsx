import React from "react";
import "./Footer.css"; // Ensure CSS is imported
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo Section */}
        <div className="footer-services">
  <h4>Our Top Services</h4>
  <ul>
    <li>✨ Hair Styling</li>
    <li>💅 Manicure & Pedicure</li>
    <li>💆‍♀️ Spa & Relaxation</li>
  </ul>
</div>


        {/* Opening Hours */}
        <div className="footer-hours">
          <h3>Opening Hours</h3>
          <p>Mon - Fri: 9:00 AM - 8:00 PM</p>
          <p>Saturday: 10:00 AM - 6:00 PM</p>
          <p>Sunday: Closed</p>
        </div>

        {/* Quick Links */}
        <ul className="footer-links">
          <li><a href="/services">Services</a></li>
          <li><a href="/appointments">Book Appointment</a></li>
          <li><a href="/contact">Contact Us</a></li>
          <li><a href="/about">About Us</a></li>
        </ul>

        {/* Social Media Icons */}
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-bottom">
        <p>&copy; 2025 Salon Bliss. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
