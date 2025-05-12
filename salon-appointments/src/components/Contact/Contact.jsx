import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [responseMessage, setResponseMessage] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

  

    try {
      const response = await fetch("https://salon-backend-qnkh.onrender.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setResponseMessage("Message sent successfully! ✅");
        setFormData({ name: "", email: "", message: "" }); // Reset form
      }
    } catch (error) {
      console.error("Error:", error);
      setResponseMessage("Failed to send message ❌");
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>Feel free to reach out to us for any queries or appointments.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Message</label>
        <textarea name="message" value={formData.message} onChange={handleChange} required></textarea>

        <button type="submit" className="contact-btn">Send Message</button>
      </form>

      {responseMessage && <p className="response-msg">{responseMessage}</p>}
    </div>
  );
};

export default Contact;
