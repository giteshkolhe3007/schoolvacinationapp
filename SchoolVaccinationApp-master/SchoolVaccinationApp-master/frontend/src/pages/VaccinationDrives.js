"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { driveService } from "../services/api.service"
import Spinner from "../components/Spinner"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.js"

const VaccinationDrives = () => {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: "",
    upcoming: false,
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [driveToDelete, setDriveToDelete] = useState(null)

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        setLoading(true)
        const params = {
          status: filter.status || undefined,
          upcoming: filter.upcoming || undefined,
        }

        const response = await driveService.getAll(params)

        if (response && response.data && response.data.drives) {
          setDrives(response.data.drives)
        } else {
          // Fallback to empty array if no drives found
          setDrives([])
        }
      } catch (error) {
        console.error("Error fetching vaccination drives:", error)
        toast.error("Failed to load vaccination drives")
        setDrives([])
      } finally {
        setLoading(false)
      }
    }

    fetchDrives()
  }, [filter])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpcomingToggle = () => {
    setFilter((prev) => ({
      ...prev,
      upcoming: !prev.upcoming,
    }))
  }

  const handleDeleteClick = (drive) => {
    setDriveToDelete(drive)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!driveToDelete) return

    try {
      await driveService.delete(driveToDelete._id)
      toast.success("Vaccination drive deleted successfully")

      // Remove the deleted drive from the list
      setDrives(drives.filter((drive) => drive._id !== driveToDelete._id))
      setShowDeleteModal(false)
      setDriveToDelete(null)
    } catch (error) {
      console.error("Error deleting vaccination drive:", error)
      toast.error("Failed to delete vaccination drive")
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setDriveToDelete(null)
  }

  const getDriveStatusClass = (status) => {
    switch (status) {
      case "Scheduled":
        return "vaccinated"
      case "Completed":
        return "vaccinated"
      case "Cancelled":
        return "not-vaccinated"
      default:
        return ""
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Vaccination Drives</h2>
        <Link to="/drives/add" className="btn btn-primary">
          <i className="fas fa-plus"></i> Schedule New Drive
        </Link>
      </div>

      <div className="filters-container">
        <div className="filter-controls-drive">
          <div className="filter-group">
            <label>Status:</label>
            <select name="status" value={filter.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <button
              onClick={handleUpcomingToggle}
              className={`btn ${filter.upcoming ? "btn-primary" : "btn-secondary"}`}
            >
              <i className="fas fa-calendar-alt"></i> {filter.upcoming ? "Showing Upcoming" : "Show Upcoming"}
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        {drives.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vaccine Name</th>
                <th>Date</th>
                <th>Available Doses</th>
                <th>Applicable Classes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((drive) => (
                <tr key={drive._id}>
                  <td>{drive.vaccineName}</td>
                  <td>{new Date(drive.date).toLocaleDateString()}</td>
                  <td>{drive.availableDoses}</td>
                  <td>{drive.applicableClasses.join(", ")}</td>
                  <td>
                    <span className={`status-badge ${getDriveStatusClass(drive.status)}`}>{drive.status}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/drives/${drive._id}`} className="btn btn-sm btn-info" title="View Details">
                        <i className="fas fa-eye"></i>
                      </Link>
                      {drive.status === "Scheduled" && (
                        <Link to={`/drives/edit/${drive._id}`} className="btn btn-sm btn-edit" title="Edit Drive">
                          <i className="fas fa-edit"></i>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteClick(drive)}
                        className="btn btn-sm btn-danger"
                        title="Delete Drive"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No vaccination drives found matching your filters.</p>
            <Link to="/drives/add" className="btn btn-primary">
              <i className="fas fa-plus"></i> Schedule New Drive
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title="Delete Vaccination Drive"
          message={`Are you sure you want to delete the ${driveToDelete?.vaccineName} drive scheduled for ${new Date(driveToDelete?.date).toLocaleDateString()}? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  )
}

export default VaccinationDrives
