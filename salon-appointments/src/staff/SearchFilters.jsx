import React from "react";

function SearchFilters({ searchTerm, setSearchTerm, filterDate, setFilterDate }) {
  return (
    <div className="d-flex gap-3 mb-3">
      <input
        type="text"
        placeholder="Search by name"
        className="form-control"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <input
        type="date"
        className="form-control"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
      />
    </div>
  );
}

export default SearchFilters;
