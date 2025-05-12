import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const toggleNavbar = () => {
    setIsNavCollapsed(prev => !prev);
  };
  
  const closeNavbar = () => {
    setIsNavCollapsed(true);
  };
  

  return (
    <nav className="navbar navbar-expand-lg salon-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src="/logo192.png" alt="Salon Luxe" className="salon-logo" />
          <span className="ms-2 brand-name">Salon Luxe</span>
        </Link>

        <button
  className="navbar-toggler"
  type="button"
  onClick={toggleNavbar}
>

          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${!isNavCollapsed ? "show" : ""}`} id="navbarNav">

          {!isLoggedIn && (
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
  <Link className={`nav-link ${location.pathname === "/services" ? "active" : ""}`} to="/services">
    Services
  </Link>
</li>
<li className="nav-item">
  <Link className={`nav-link ${location.pathname === "/about" ? "active" : ""}`} to="/about">
    About
  </Link>
</li>

              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`} to="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          )}

          <div className="d-flex ms-auto mt-2 mt-lg-0">
            {isLoggedIn ? (
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>

<Link className={`nav-link ${location.pathname === "/" ? "active" : ""}`} to="/" onClick={closeNavbar}>

</Link>

                <Link className="btn btn-l btn-outline-light me-2 btn-sm" to="/login">
                  Login
                </Link>
                <Link className="btn btn-warning btn-sm" to="/add-appointment">
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
