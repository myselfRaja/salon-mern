import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import AppointmentList from "./staff/AppointmentList";
import AppointmentForm from "./form/AppointmentForm";
import Home from "./pages/Home";
import Services from "./components/Services/Services";
import Contact from "./components/Contact/Contact";
import About from "./pages/About";
import Footer from "./components/Footer/Footer";
import Login from "./pages/Login";
import Reports from "./staff/Reports";
// ✅ YEH ROUTE ADD KARO

function App() {
  return (
    <Router basename="/">
      <div className="app-container">
        <Navbar />
        <div className="main-content container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book" element={<AppointmentForm />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/add-appointment" element={<AppointmentForm />} />
<Route path="/reports" element={<Reports />} />

          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}


export default App;
