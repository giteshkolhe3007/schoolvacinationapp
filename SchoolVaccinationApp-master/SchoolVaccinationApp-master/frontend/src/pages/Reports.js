"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { reportService } from "../services/api.service"

const Reports = () => {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState([])
  const [filter, setFilter] = useState({
    vaccineName: "",
    fromDate: "",
    toDate: "",
    class: "",
  })
  const [errors, setErrors] = useState({})
  const [vaccines, setVaccines] = useState([])
  const [stats, setStats] = useState({
    totalReports: 0,
    totalVaccines: 0,
    dateRange: "All time",
  })
  const [isFiltered, setIsFiltered] = useState(false)

  useEffect(() => {
    // Fetch available vaccines for filter dropdown
    fetchVaccines()
  }, [])

  const fetchVaccines = async () => {
    try {
      setLoading(true)
      const availableVaccinesResponse = await reportService.getAvailableVaccines()

      if (availableVaccinesResponse && availableVaccinesResponse.data) {
        setVaccines(availableVaccinesResponse.data)
        setStats((prev) => ({
          ...prev,
          totalVaccines: availableVaccinesResponse.data.length,
        }))
      } else {
        setVaccines([])
        setStats((prev) => ({
          ...prev,
          totalVaccines: 0,
        }))
      }
    } catch (error) {
      console.error("Error fetching vaccines:", error)
      toast.error("Failed to load vaccine data")
      setVaccines([])
      setStats((prev) => ({
        ...prev,
        totalVaccines: 0,
      }))
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate date range if both dates are provided
    if (filter.fromDate && filter.toDate) {
      const fromDate = new Date(filter.fromDate)
      const toDate = new Date(filter.toDate)

      if (fromDate > toDate) {
        newErrors.dateRange = "From Date cannot be after To Date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear errors when user changes input
    if (errors[name] || errors.dateRange) {
      setErrors({})
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      generateReport(false) // Don't download CSV automatically
    } else {
      toast.error("Please fix the errors in the form")
    }
  }

  const handleGenerateAndDownload = (e) => {
    e.preventDefault()

    if (validateForm()) {
      generateReport(true) // Download CSV automatically
    } else {
      toast.error("Please fix the errors in the form")
    }
  }

  const clearFilters = () => {
    setFilter({
      vaccineName: "",
      fromDate: "",
      toDate: "",
      class: "",
    })
    setErrors({})
    setIsFiltered(false)

    // If there was a previous report, clear it
    if (report.length > 0) {
      setReport([])
      setStats((prev) => ({
        ...prev,
        totalReports: 0,
        dateRange: "All time",
      }))
      toast.info("Filters cleared")
    }
  }

  const generateReport = async (downloadAfterGeneration = false) => {
    setLoading(true)

    try {
      // Check if any filter is applied
      const hasFilters = Object.values(filter).some((value) => value !== "")
      setIsFiltered(hasFilters)

      // Fetch from API
      const params = {
        vaccineName: filter.vaccineName || undefined,
        fromDate: filter.fromDate || undefined,
        toDate: filter.toDate || undefined,
        class: filter.class || undefined,
      }

      const response = await reportService.generateReport(params)

      if (response && response.data) {
        setReport(response.data)
        setStats((prev) => ({
          ...prev,
          totalReports: response.data.length,
          dateRange:
            filter.fromDate && filter.toDate
              ? `${new Date(filter.fromDate).toLocaleDateString()} - ${new Date(filter.toDate).toLocaleDateString()}`
              : filter.fromDate
                ? `From ${new Date(filter.fromDate).toLocaleDateString()}`
                : filter.toDate
                  ? `Until ${new Date(filter.toDate).toLocaleDateString()}`
                  : "All time",
        }))

        if (response.data.length === 0) {
          toast.info("No records found matching your criteria")
        } else {
          toast.success(`Generated report with ${response.data.length} records`)

          // Download CSV if requested
          if (downloadAfterGeneration) {
            downloadCSV()
          }
        }
      } else {
        setReport([])
        toast.info("No records found")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
      setReport([])
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (report.length === 0) {
      toast.error("No data to download")
      return
    }

    // Create CSV header
    let csv = "Name,Student ID,Class,Section,Vaccine Name,Date Administered\n"

    // Add data rows
    report.forEach((row) => {
      const dateAdministered = new Date(row.dateAdministered).toLocaleDateString()
      csv += `${row.name},${row.studentId},${row.class},${row.section},${row.vaccineName},${dateAdministered}\n`
    })

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `vaccination_report_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast.success("Report downloaded successfully")
  }

  // Helper function to display active filters
  const getActiveFiltersText = () => {
    const activeFilters = []

    if (filter.vaccineName) activeFilters.push(`Vaccine: ${filter.vaccineName}`)
    if (filter.class) activeFilters.push(`Class: ${filter.class}`)
    if (filter.fromDate) activeFilters.push(`From: ${new Date(filter.fromDate).toLocaleDateString()}`)
    if (filter.toDate) activeFilters.push(`To: ${new Date(filter.toDate).toLocaleDateString()}`)

    return activeFilters.length > 0 ? activeFilters.join(" | ") : "None"
  }

  return (
    <div>
      <h2 className="page-title">Vaccination Reports</h2>

      {/* Quick Stats Cards */}
      <div className="stats-container mb-4">
        <div className="stat-card">
          <div className="stat-icon students-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-details">
            <h3>Report Records</h3>
            <p className="stat-value">{stats.totalReports}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon vaccinated-icon">
            <i className="fas fa-syringe"></i>
          </div>
          <div className="stat-details">
            <h3>Vaccines Available</h3>
            <p className="stat-value">{stats.totalVaccines}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rate-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-details">
            <h3>Date Range</h3>
            <p className="stat-value" style={{ fontSize: "0.9rem" }}>
              {stats.dateRange}
            </p>
          </div>
        </div>
      </div>

      <div className="filters-container">
        <form onSubmit={handleSubmit} className="report-form">
          <div className="report-form-row">
            <div className="filter-group">
              <label>Vaccine Name</label>
              <select
                name="vaccineName"
                value={filter.vaccineName}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="">All Vaccines</option>
                {vaccines.map((vaccine) => (
                  <option key={vaccine} value={vaccine}>
                    {vaccine}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                name="fromDate"
                class="date-input"
                value={filter.fromDate}
                onChange={handleFilterChange}
                className={`form-control date-input ${errors.dateRange ? "input-error" : ""}`}
              />
            </div>

            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                name="toDate"
                 class="date-input"
                value={filter.toDate}
                onChange={handleFilterChange}
                className={`form-control date-input ${errors.dateRange ? "input-error" : ""}`}
              />
            </div>

            <div className="filter-group">
              <label>Class</label>
              <select name="class" value={filter.class} onChange={handleFilterChange} className="form-control">
                <option value="">All Classes</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>
                    Class {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errors.dateRange && <div className="error-message">{errors.dateRange}</div>}

          {/* Active filters display */}
          {isFiltered && (
            <div className="active-filters">
              <span>Active Filters: </span>
              <span className="filter-tags">{getActiveFiltersText()}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-generate-report" disabled={loading}>
              <i className="fas fa-search"></i> Generate Report
            </button>
            <button type="button" onClick={clearFilters} className="btn-clear-filters" disabled={loading}>
              <i className="fas fa-times"></i> Clear Filters
            </button>
          </div>
        </form>
      </div>

      <div className="upcoming-drives">
        <div className="section-header">
          <h3>Vaccination Report</h3>
          {report.length > 0 && (
            <button onClick={downloadCSV} className="btn btn-secondary">
              <i className="fas fa-download"></i> Download CSV
            </button>
          )}
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Generating report...</span>
            </div>
          ) : report.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Vaccine Name</th>
                  <th>Date Administered</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row, index) => (
                  <tr key={index}>
                    <td>{row.name}</td>
                    <td>{row.studentId}</td>
                    <td>Class {row.class}</td>
                    <td>{row.section}</td>
                    <td>{row.vaccineName}</td>
                    <td>{new Date(row.dateAdministered).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <p>No report data available</p>
              <p className="text-sm text-gray-400">Use the filters above to generate a report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports
