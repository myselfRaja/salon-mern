import React, { useState, useEffect } from 'react';
import { getSalesReport, exportReport } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let params = { period };
      
      if (period === 'custom') {
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }
      
      const response = await getSalesReport(params);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      let params = { period, format: exportFormat };
      
      if (period === 'custom') {
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }
      
      const response = await exportReport(params);
      
      // Create download link
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `salon-report-${period}-${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const renderCustomDatePicker = () => {
    if (period !== 'custom') return null;
    
    return (
      <div className="custom-date-range">
        <div className="date-picker-group">
          <label>From:</label>
          <DatePicker 
            selected={startDate} 
            onChange={date => setStartDate(date)} 
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
        </div>
        <div className="date-picker-group">
          <label>To:</label>
          <DatePicker 
            selected={endDate} 
            onChange={date => setEndDate(date)} 
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </div>
        <button className="apply-date-btn" onClick={fetchReport}>
          Apply
        </button>
      </div>
    );
  };

  return (
    <div className="reports-dashboard">
      <div className="dashboard-header">
        <h2>📊 Salon Performance Dashboard</h2>
        <div className="header-actions">
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
            className="export-select"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
          <button className="export-btn" onClick={handleExport}>
            Export Report
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="filters-card">
        <div className="filter-group">
          <label>Report Period: </label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {renderCustomDatePicker()}
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading report data...</div>
      ) : reportData ? (
        <div className="dashboard-content">
          {/* KPI Cards */}
          <div className="kpi-cards">
            <div className="kpi-card">
              <div className="kpi-icon">💰</div>
              <div className="kpi-content">
                <h3>₹{reportData.totalSales?.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-icon">🧾</div>
              <div className="kpi-content">
                <h3>{reportData.totalInvoices}</h3>
                <p>Total Appointments</p>
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-icon">📈</div>
              <div className="kpi-content">
                <h3>₹{reportData.averageBill?.toFixed(2)}</h3>
                <p>Average Bill Value</p>
              </div>
            </div>
            
            <div className="kpi-card">
              <div className="kpi-icon">🧾</div>
              <div className="kpi-content">
                <h3>₹{reportData.totalTax?.toLocaleString()}</h3>
                <p>Total Tax</p>
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="charts-row">
            {/* Revenue Trend Chart */}
            <div className="chart-card">
              <h3>Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.salesByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Top Services Chart */}
            <div className="chart-card">
              <h3>Top Services</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.topServices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {reportData.topServices?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Additional Data Sections */}
          <div className="data-sections">
            {/* Payment Methods */}
            <div className="data-card">
              <h3>Payment Methods</h3>
              <div className="payment-methods">
                {reportData.paymentMethods && Object.entries(reportData.paymentMethods).map(([method, amount]) => (
                  <div key={method} className="payment-method-item">
                    <span className="method-name">{method}</span>
                    <span className="method-amount">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Top Clients */}
            <div className="data-card">
              <h3>Top Clients</h3>
              <div className="clients-list">
                {reportData.topClients?.map((client, index) => (
                  <div key={index} className="client-item">
                    <span className="client-rank">#{index + 1}</span>
                    <span className="client-name">{client.client}</span>
                    <span className="client-revenue">₹{client.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Detailed Sales Table */}
          {reportData.salesByDate && (
            <div className="data-card">
              <h3>Detailed Sales Data</h3>
              <div className="table-container">
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Appointments</th>
                      <th>Revenue</th>
                      <th>Average Bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.salesByDate.map((entry, index) => (
                      <tr key={index}>
                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                        <td>{entry.count || 0}</td>
                        <td>₹{entry.total?.toLocaleString()}</td>
                        <td>₹{entry.average?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">No report data available. Select a period to generate reports.</div>
      )}
    </div>
  );
};

export default Reports;