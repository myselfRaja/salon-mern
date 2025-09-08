import axios from 'axios';

const API_BASE_URL = "http://localhost:3001";

// ✅ Yeh naya code - Token automatically add hoga
const api = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ Automatic token attachment
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all appointments
export const getAppointments = async () => {
  return await api.get('/appointments');
};

// Add an appointment
export const addAppointment = async (appointmentData) => {
  return await api.post('/appointments', appointmentData);
};

// Update an appointment
export const updateAppointment = async (id, appointmentData) => {
  return await api.put(`/appointments/${id}`, appointmentData);
};

// Delete an appointment
export const deleteAppointment = async (id) => {
  return await api.delete(`/appointments/${id}`);
};

// ✅ INVOICE APIs - Simple ho gaya
export const generateInvoice = async (invoiceData) => {
  return await api.post('/api/invoices/generate', invoiceData);
};

export const getInvoices = async () => {
  return await api.get('/api/invoices');
};

// api.js
export const getSalesReport = async (params = { period: "daily" }) => {
  let query = `period=${params.period || "daily"}`;

  if (params.startDate && params.endDate) {
    query += `&startDate=${params.startDate}&endDate=${params.endDate}`;
  }

  return await api.get(`/api/invoices/reports/sales?${query}`);
};

export const exportReport = async (params = { period: "daily", format: "pdf" }) => {
  let query = `period=${params.period || "daily"}&format=${params.format || "pdf"}`;

  if (params.startDate && params.endDate) {
    query += `&startDate=${params.startDate}&endDate=${params.endDate}`;
  }

  return await api.get(`/api/invoices/reports/export?${query}`, {
    responseType: "blob", // for file download
  });
};



export const sendInvoiceEmail = async (invoiceId) => {
  return await api.post(`/api/invoices/${invoiceId}/email`, {});
};

export const getSalonConfig = async () => {
  return await api.get('/api/salon-config');
};

export const updateSalonConfig = async (configData) => {
  return await api.put('/api/salon-config', configData);
};