// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ... imports same

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    try {
      const response = await axios.post("https://salon-backend-qnkh.onrender.com/api/auth/login", {
        username: trimmedUsername,
        password: trimmedPassword,
      });

      const { token } = response.data;
      localStorage.setItem("authToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Login successful!", {
        onClose: () => window.location.href = "/appointments",
      });

    } catch (error) {
      const message = error.response?.data?.message || 
                     "Server unavailable. Try later.";
      setErrorMsg(message);
      toast.error(message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card animated">
        <h2 className="text-center mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-dark w-100">
            Login
          </button>

          {errorMsg && <div className="alert alert-danger mt-3">{errorMsg}</div>}
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
