import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentTable from "./AppointmentTable";
import AppointmentModal from "./AppointmentModal";
import SearchFilters from "./SearchFilters";
import ExportButton from "./ExportButton";
import { toast } from "react-toastify";
import Loader from "../components/Common/Loader";


function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    date: "", 
    time: "",
    services: [],
    phone: "",
    email: "" 
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const appointmentsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    } else {
      fetchAppointments();
    }
  }, [navigate]);

 const fetchAppointments = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

    // ✅ YAHAN CHANGE KARO - limit=1000 add karo
    const response = await fetch(`${backendURL}/api/appointments?limit=1000`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      navigate("/login");
      return;
    }

    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    setAppointments(data.appointments || []);
     
  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("Failed to load appointments");
  } finally {
    setLoading(false);
  }
};

  const handleUpdateSuccess = (updatedAppointment) => {
    setAppointments(prev => 
      prev.map(appt => appt._id === updatedAppointment._id ? updatedAppointment : appt)
    );
    toast.success("Appointment updated successfully");
    setEditingAppointment(null);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
     const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const response = await fetch(`${backendURL}/api/appointments/${id}`, {

        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Delete failed");

      setAppointments(prev => prev.filter(appt => appt._id !== id));
      toast.success("Appointment deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete appointment");
    }
  };

  // ✅ YEH NAYA CODE ADD KARO

// 1. Pehle filtered appointments safe way mein calculate karo
const filteredAppointments = (appointments || []).filter((appt) => {
  const matchesName = appt.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
  const matchesDate = filterDate
    ? new Date(appt.date).toISOString().split("T")[0] === filterDate
    : true;
  return matchesName && matchesDate;
});

// 2. Current page ki appointments
const indexOfLast = currentPage * appointmentsPerPage;
const indexOfFirst = indexOfLast - appointmentsPerPage;
const currentAppointments = filteredAppointments.slice(indexOfFirst, indexOfLast);

// 3. Total pages calculation
const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

// 4. ✅ NAYA PAGINATION LOGIC - Sirf 10 buttons dikhane ke liye
const visiblePageCount = 10;
const currentGroup = Math.floor((currentPage - 1) / visiblePageCount);
const startPage = currentGroup * visiblePageCount + 1;
const endPage = Math.min(startPage + visiblePageCount - 1, totalPages);
const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

const handlePageChange = (page) => {
  setCurrentPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


  if (loading) return <Loader type="overlay" message="Loading appointments..." />;



  return (
    <div className="container mt-4">
      <h2 className="text-center mb-3">Appointments</h2>
      
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
      />
      
      <div className="d-flex justify-content-between mb-3">
        <ExportButton appointments={appointments} />
        <h5>Total Appointments: {filteredAppointments.length}</h5>
      </div>

      <AppointmentModal
        editingAppointment={editingAppointment}
        setEditingAppointment={setEditingAppointment}
        formData={formData}
        setFormData={setFormData}
        onUpdateSuccess={handleUpdateSuccess}
        isUpdating={isUpdating}
        setIsUpdating={setIsUpdating}
          onAdd={() => {
    setCurrentPage(1);   // Reset to first page
    fetchAppointments(); // Re-fetch appointments
  }}
      />

      <AppointmentTable
        currentAppointments={currentAppointments}
        setEditingAppointment={setEditingAppointment}
        setFormData={setFormData}
        handleDelete={handleDelete}
      />

{totalPages > 1 && (
  <div className="d-flex justify-content-center mt-3 flex-wrap">
    {/* ✅ "Prev 10" button - jab 1st group nahi ho */}
    {startPage > 1 && (
      <button
        className="btn btn-outline-secondary mx-1"
         onClick={() => handlePageChange(startPage - visiblePageCount)}
      >
        « Prev 10
      </button>
    )}

    {/* Page Numbers */}
    {visiblePages.map((page) => (
      <button
        key={page}
        onClick={() => handlePageChange(page)}
        className={`btn mx-1 ${currentPage === page ? "btn-primary" : "btn-outline-primary"}`}
      >
        {page}
      </button>
    ))}

    {/* ✅ "Next 10" button - jab last group nahi ho */}
    {endPage < totalPages && (
      <button
        className="btn btn-outline-secondary mx-1"
        onClick={() => handlePageChange(endPage + 1)}
      >
        Next 10 »
      </button>
    )}
  </div>
)}

    </div>
  );
}

export default AppointmentList;