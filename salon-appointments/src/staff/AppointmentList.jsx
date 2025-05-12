import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentTable from "./AppointmentTable";
import AppointmentModal from "./AppointmentModal";
import SearchFilters from "./SearchFilters";
import ExportButton from "./ExportButton";
import { toast } from "react-toastify";

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
      const response = await fetch("https://salon-backend-qnkh.onrender.com/api/appointments", {
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
      setAppointments(data);
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
      const response = await fetch(`https://salon-backend-qnkh.onrender.com/api/appointments/${id}`, {
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

  const filteredAppointments = appointments.filter((appt) => {
    const matchesName = appt.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate
      ? new Date(appt.date).toISOString().split("T")[0] === filterDate
      : true;
    return matchesName && matchesDate;
  });

  const indexOfLast = currentPage * appointmentsPerPage;
  const indexOfFirst = indexOfLast - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;

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
      />

      <AppointmentTable
        currentAppointments={currentAppointments}
        setEditingAppointment={setEditingAppointment}
        setFormData={setFormData}
        handleDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`btn mx-1 ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentList;