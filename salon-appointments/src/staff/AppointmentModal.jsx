import React from "react";

function AppointmentModal({
  editingAppointment,
  setEditingAppointment,
  formData,
  setFormData,
  onUpdateSuccess,
  isUpdating,
  setIsUpdating
}) {
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://salon-backend-qnkh.onrender.com/api/appointments/${editingAppointment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Update failed");

      const updated = await response.json();
      onUpdateSuccess(updated);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!editingAppointment) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleUpdate}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Appointment</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setEditingAppointment(null)}
                disabled={isUpdating}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingAppointment(null)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AppointmentModal;