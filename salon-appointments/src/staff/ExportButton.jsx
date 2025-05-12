import React from "react";

function ExportButton({ appointments }) {
  const exportToCSV = () => {
    const rows = [
      ["Token", "Name", "Phone", "Email", "Date", "Time", "Services", "Duration", "Total Price"],
      ...appointments.map((appt, index) => [
        index + 1,
        appt.name,
        appt.phone,
        appt.email,
        appt.date,
        appt.time,
        appt.services,
        appt.duration,
        appt.totalPrice,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "appointments.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <button className="btn btn-outline-primary" onClick={exportToCSV}>
      Export CSV
    </button>
  );
}

export default ExportButton;
