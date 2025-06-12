import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Check auth status with useCallback for stability
  const checkAuthStatus = useCallback(() => {
    setIsLoggedIn(!!localStorage.getItem("authToken"));
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [location, checkAuthStatus]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setIsNavCollapsed(true); // Close navbar on logout
    navigate("/login");
  };

  const toggleNavbar = () => setIsNavCollapsed(prev => !prev);
  const closeNavbar = () => setIsNavCollapsed(true);

  // Common navigation items for cleaner JSX
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/services", label: "Services" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="navbar navbar-expand-lg salon-navbar">
      <div className="container">
        <Link 
          className="navbar-brand d-flex align-items-center" 
          to="/"
          onClick={closeNavbar}
          aria-label="Go to homepage"
        >
          <img 
            src="/logo192.png" 
            alt="Salon Luxe" 
            className="salon-logo"
            width="35"
            height="35"
          />
          <span className="ms-2 brand-name">Salon Luxe</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-label="Toggle navigation"
          aria-expanded={!isNavCollapsed}
          aria-controls="navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div 
          className={`collapse navbar-collapse ${!isNavCollapsed ? "show" : ""}`} 
          id="navbarNav"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!isLoggedIn && navItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link
                  className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
                  to={item.path}
                  onClick={closeNavbar}
                  aria-current={location.pathname === item.path ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="d-flex mt-2 mt-lg-0">
            {isLoggedIn ? (
              <button 
                className="btn btn-outline-light btn-sm" 
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            ) : (
              <>
                <Link 
                  className="btn btn-login me-2 btn-sm" 
                  to="/login"
                  onClick={closeNavbar}
                  aria-label="Login"
                >
                  Login
                </Link>
                <Link 
                  className="btn btn-warning btn-sm" 
                  to="/add-appointment"
                  onClick={closeNavbar}
                  aria-label="Book Appointment"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;