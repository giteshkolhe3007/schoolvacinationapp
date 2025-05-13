"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import {
  FaEdit,
  FaCheckCircle,
  FaTimes,
  FaSyringe,
  FaArrowLeft,
  FaEye,
  FaCalendarAlt,
  FaUserGraduate,
  FaInfoCircle,
} from "react-icons/fa"
import Spinner from "../components/Spinner"
import { driveService, studentService } from "../services/api.service"

const DriveDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [drive, setDrive] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentLoading, setStudentLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: "",
  })

  useEffect(() => {
    const fetchDriveDetails = async () => {
      try {
        setLoading(true)
        const response = await driveService.getById(id)
        setDrive(response.data)
      } catch (err) {
        toast.error("Failed to load drive details")
        console.error(err)
        navigate("/drives")
      } finally {
        setLoading(false)
      }
    }

    fetchDriveDetails()
  }, [id, navigate])

  useEffect(() => {
    const fetchStudents = async () => {
      if (!drive) return

      try {
        setStudentLoading(true)
        const response = await driveService.getStudents(id, { status: filter.status })
        setStudents(response.data.students)
      } catch (err) {
        console.error("Failed to load students for drive:", err)
        toast.error("Failed to load students for this drive")
      } finally {
        setStudentLoading(false)
      }
    }

    if (drive) {
      fetchStudents()
    }
  }, [drive, id, filter.status])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCompleteDrive = async () => {
    if (!window.confirm("Are you sure you want to mark this drive as completed? This action cannot be undone.")) {
      return
    }

    try {
      await driveService.complete(id)
      setDrive((prev) => ({
        ...prev,
        status: "Completed",
      }))
      toast.success("Vaccination drive marked as completed")
    } catch (err) {
      toast.error("Failed to complete drive")
      console.error(err)
    }
  }

  const handleCancelDrive = async () => {
    if (!window.confirm("Are you sure you want to cancel this drive? This action cannot be undone.")) {
      return
    }

    try {
      await driveService.cancel(id)
      setDrive((prev) => ({
        ...prev,
        status: "Cancelled",
      }))
      toast.success("Vaccination drive cancelled")
    } catch (err) {
      toast.error("Failed to cancel drive")
      console.error(err)
    }
  }

  const handleVaccinateStudent = async (studentId) => {
    try {
      await studentService.vaccinate(studentId, id)

      // Update student vaccination status in the list
      setStudents((prev) =>
        prev.map((student) => {
          if (student._id === studentId) {
            return {
              ...student,
              vaccinations: student.vaccinations.map((v) => {
                if (v.drive === id) {
                  return { ...v, status: "Completed" }
                }
                return v
              }),
            }
          }
          return student
        }),
      )

      // Update available doses
      setDrive((prev) => ({
        ...prev,
        availableDoses: prev.availableDoses - 1,
      }))

      toast.success("Student vaccinated successfully")
    } catch (err) {
      toast.error("Failed to vaccinate student")
      console.error(err)
    }
  }

  const getDriveStatusClass = (status) => {
    switch (status) {
      case "Scheduled":
        return "detail-badge-blue"
      case "Completed":
        return "detail-badge-green"
      case "Cancelled":
        return "detail-badge-red"
      default:
        return ""
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (!drive) {
    return <div className="text-center py-8">Drive not found</div>
  }

  const isScheduled = drive.status === "Scheduled"
  const isPastDrive = new Date(drive.date) < new Date()
  const canEdit = isScheduled && !isPastDrive

  return (
    <div>
      <Link to="/drives" className="back-button">
        <FaArrowLeft /> Back to Vaccination Drives
      </Link>

      <div className="detail-container">
        <div className="detail-header">
          <h1 className="detail-title">
            <FaCalendarAlt className="mr-2" /> Vaccination Drive Details
          </h1>
          <div className="action-buttons">
            {canEdit && (
              <Link to={`/drives/edit/${id}`} className="btn btn-primary">
                <FaEdit className="mr-2" /> Edit Drive
              </Link>
            )}
            {isScheduled && (
              <>
                <button onClick={handleCompleteDrive} className="btn btn-success ml-2">
                  <FaCheckCircle className="mr-2" /> Mark as Completed
                </button>
                <button onClick={handleCancelDrive} className="btn btn-danger ml-2">
                  <FaTimes className="mr-2" /> Cancel Drive
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h2 className="detail-section-title">Drive Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-item-label">Vaccine Name</div>
                <div className="detail-item-value">{drive.vaccineName}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Date</div>
                <div className="detail-item-value">{new Date(drive.date).toLocaleDateString()}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Status</div>
                <div className="detail-item-value">
                  <span className={`detail-badge ${getDriveStatusClass(drive.status)}`}>{drive.status}</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Available Doses</div>
                <div className="detail-item-value">{drive.availableDoses}</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2 className="detail-section-title">Additional Information</h2>
            <div className="detail-item">
              <div className="detail-item-label">Applicable Classes</div>
              <div className="detail-tag-container">
                {drive.applicableClasses.map((classValue) => (
                  <span key={classValue} className="detail-tag">
                    Class {classValue}
                  </span>
                ))}
              </div>
            </div>

            {drive.createdBy && (
              <div className="detail-item mt-4">
                <div className="detail-item-label">Created By</div>
                <div className="detail-item-value">{drive.createdBy.username}</div>
              </div>
            )}

            <div className="detail-item mt-4">
              <div className="detail-item-label">Created At</div>
              <div className="detail-item-value">{new Date(drive.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Students for this drive */}
      <div className="detail-container mt-6">
        <div className="detail-header">
          <h2 className="detail-title">
            <FaUserGraduate className="mr-2" /> Students
          </h2>
          <div className="filter-group">
            <label>Status:</label>
            <select name="status" value={filter.status} onChange={handleFilterChange} className="ml-2">
              <option value="">All Statuses</option>
              <option value="Completed">Vaccinated</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Missed">Missed</option>
            </select>
          </div>
        </div>

        <div className="detail-content">
          {studentLoading ? (
            <div className="text-center py-4">
              <div className="spinner"></div>
              <p className="mt-2 text-gray-500">Loading students...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Vaccination Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    // Find vaccination record for this drive
                    const vaccinationRecord = student.vaccinations.find((v) => v.drive === id)
                    const vaccinationStatus = vaccinationRecord ? vaccinationRecord.status : "Not Scheduled"

                    return (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.studentId}</td>
                        <td>Class {student.class}</td>
                        <td>{student.section}</td>
                        <td>
                          <span
                            className={`detail-badge ${
                              vaccinationStatus === "Completed"
                                ? "detail-badge-green"
                                : vaccinationStatus === "Missed"
                                  ? "detail-badge-red"
                                  : "detail-badge-yellow"
                            }`}
                          >
                            {vaccinationStatus}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link to={`/students/${student._id}`} className="btn btn-sm btn-info" title="View Student">
                              <FaEye />
                            </Link>
                            {isScheduled && vaccinationStatus !== "Completed" && drive.availableDoses > 0 && (
                              <button
                                onClick={() => handleVaccinateStudent(student._id)}
                                className="btn btn-sm btn-success ml-2"
                                title="Vaccinate Student"
                              >
                                <FaSyringe />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaInfoCircle className="mx-auto text-blue-400 mb-2" size={24} />
              <p className="text-gray-500">No students found for this vaccination drive.</p>
              {filter.status && (
                <p className="text-sm text-gray-400 mt-2">Try changing the status filter to see more results.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DriveDetails
