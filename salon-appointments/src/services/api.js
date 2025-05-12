import axios from 'axios';

const API_BASE_URL = "http://localhost:3001"; // Your backend URL

// Get all appointments
export const getAppointments = async () => {
    return await axios.get(`${API_BASE_URL}/appointments`);
};

// Add an appointment
export const addAppointment = async (appointmentData) => {
    return await axios.post(`${API_BASE_URL}/appointments`, appointmentData);
};

// Update an appointment
export const updateAppointment = async (id, appointmentData) => {
    return await axios.put(`${API_BASE_URL}/appointments/${id}`, appointmentData);
};

// Delete an appointment
export const deleteAppointment = async (id) => {
    return await axios.delete(`${API_BASE_URL}/appointments/${id}`);
};
