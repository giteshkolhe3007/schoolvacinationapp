"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import { FaEdit, FaSyringe, FaArrowLeft, FaUserGraduate, FaCalendarAlt, FaInfoCircle } from "react-icons/fa"
import { studentService, driveService } from "../services/api.service"
import Spinner from "../components/Spinner"

const StudentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upcomingDrives, setUpcomingDrives] = useState([])
  const [loadingDrives, setLoadingDrives] = useState(true)
  const [selectedDrive, setSelectedDrive] = useState("")
  const [vaccinating, setVaccinating] = useState(false)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await studentService.getById(id)
        setStudent(response.data)
      } catch (err) {
        toast.error("Failed to load student data")
        console.error(err)
        navigate("/students")
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id, navigate])

  useEffect(() => {
    const fetchUpcomingDrives = async () => {
      if (!student) return

      try {
        setLoadingDrives(true)
        const response = await driveService.getAll({ upcoming: true })

        // Filter drives applicable to student's class
        const applicableDrives = response.data.drives.filter((drive) => drive.applicableClasses.includes(student.class))

        setUpcomingDrives(applicableDrives)
      } catch (err) {
        console.error("Failed to load upcoming drives:", err)
      } finally {
        setLoadingDrives(false)
      }
    }

    if (student) {
      fetchUpcomingDrives()
    }
  }, [student])

  const handleVaccinate = async () => {
    if (!selectedDrive) {
      toast.error("Please select a vaccination drive")
      return
    }

    try {
      setVaccinating(true)
      await studentService.vaccinate(id, selectedDrive)
      toast.success("Student vaccinated successfully")

      // Refresh student data
      const response = await studentService.getById(id)
      setStudent(response.data)

      // Reset selection
      setSelectedDrive("")
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to vaccinate student"
      toast.error(errorMessage)
    } finally {
      setVaccinating(false)
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (!student) {
    return <div>Student not found</div>
  }

  // Check if student has any vaccinations
  const hasVaccinations = student.vaccinations && student.vaccinations.length > 0
  const isVaccinated = hasVaccinations && student.vaccinations.some((v) => v.status === "Completed")

  return (
    <div>
      <Link to="/students" className="back-button">
        <FaArrowLeft /> Back to Students
      </Link>

      <div className="detail-container">
        <div className="detail-header">
          <h1 className="detail-title">
            <FaUserGraduate className="mr-2" /> Student Details
          </h1>
          <Link to={`/students/${id}/edit`} className="btn btn-primary">
            <FaEdit className="mr-2" />
            Edit Student
          </Link>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h2 className="detail-section-title">Personal Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-item-label">Full Name</div>
                <div className="detail-item-value">{student.name}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Student ID</div>
                <div className="detail-item-value">{student.studentId}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Age</div>
                <div className="detail-item-value">{student.age} years</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Gender</div>
                <div className="detail-item-value">{student.gender}</div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2 className="detail-section-title">Academic Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-item-label">Class</div>
                <div className="detail-item-value">Class {student.class}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Section</div>
                <div className="detail-item-value">{student.section}</div>
              </div>

              <div className="detail-item">
                <div className="detail-item-label">Vaccination Status</div>
                <div className="detail-item-value">
                  <span className={`status-badge ${isVaccinated ? "vaccinated" : "not-vaccinated"}`}>
                    {isVaccinated ? "Vaccinated" : "Not Vaccinated"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vaccination History */}
      <div className="detail-container">
        <div className="detail-header">
          <h2 className="detail-title">
            <FaCalendarAlt className="mr-2" /> Vaccination History
          </h2>
        </div>

        <div className="detail-content">
          {hasVaccinations ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vaccine Name</th>
                    <th>Date Administered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {student.vaccinations.map((vaccination, index) => (
                    <tr key={index}>
                      <td>{vaccination.vaccineName}</td>
                      <td>
                        {vaccination.dateAdministered
                          ? new Date(vaccination.dateAdministered).toLocaleDateString()
                          : "Not administered yet"}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            vaccination.status === "Completed"
                              ? "vaccinated"
                              : vaccination.status === "Missed"
                                ? "not-vaccinated"
                                : ""
                          }`}
                        >
                          {vaccination.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaInfoCircle className="mx-auto text-blue-400 mb-2" size={24} />
              <p className="text-gray-500">No vaccination records found for this student</p>
            </div>
          )}
        </div>
      </div>

      {/* Vaccinate Student */}
      <div className="detail-container">
        <div className="detail-header">
          <h2 className="detail-title">
            <FaSyringe className="mr-2" /> Vaccinate Student
          </h2>
        </div>

        <div className="detail-content">
          {loadingDrives ? (
            <div className="text-center py-4">
              <div className="spinner"></div>
              <p className="mt-2 text-gray-500">Loading available vaccination drives...</p>
            </div>
          ) : upcomingDrives.length > 0 ? (
            <div>
              <div className="form-group">
                <label className="detail-item-label">Select Vaccination Drive</label>
                <select
                  value={selectedDrive}
                  onChange={(e) => setSelectedDrive(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select a drive</option>
                  {upcomingDrives.map((drive) => (
                    <option key={drive._id} value={drive._id}>
                      {drive.vaccineName} - {new Date(drive.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="detail-actions">
                <button onClick={handleVaccinate} disabled={!selectedDrive || vaccinating} className="btn btn-success">
                  <FaSyringe className="mr-2" />
                  {vaccinating ? "Vaccinating..." : "Vaccinate Student"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <FaInfoCircle className="mx-auto text-blue-400 mb-2" size={24} />
              <p className="text-gray-500">No upcoming vaccination drives available for this student's class</p>
              <Link to="/drives/add" className="btn btn-primary mt-4">
                <FaCalendarAlt className="mr-2" /> Schedule New Drive
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDetails
