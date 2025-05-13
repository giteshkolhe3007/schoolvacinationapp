"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import { driveService } from "../services/api.service"
import Spinner from "../components/Spinner"

const DriveForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [drive, setDrive] = useState({
    vaccineName: "",
    date: "",
    availableDoses: "",
    applicableClasses: [],
  })
  const [errors, setErrors] = useState({})

  // List of available classes
  const availableClasses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

  useEffect(() => {
    if (isEditMode) {
      const fetchDrive = async () => {
        try {
          setLoading(true)
          const response = await driveService.getById(id)

          if (response && response.data) {
            const { vaccineName, date, availableDoses, applicableClasses } = response.data

            setDrive({
              vaccineName,
              date: new Date(date).toISOString().split("T")[0],
              availableDoses: availableDoses.toString(),
              applicableClasses,
            })
          }
        } catch (err) {
          console.error("Error fetching drive:", err)
          toast.error("Failed to load vaccination drive data")
          navigate("/drives")
        } finally {
          setLoading(false)
        }
      }

      fetchDrive()
    } else {
      // Set default date to 15 days from now for new drives
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 15)

      setDrive((prev) => ({
        ...prev,
        date: defaultDate.toISOString().split("T")[0],
      }))
    }
  }, [id, isEditMode, navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!drive.vaccineName.trim()) newErrors.vaccineName = "Vaccine name is required"

    if (!drive.date) {
      newErrors.date = "Date is required"
    } else {
      // Check if date is at least 15 days in the future for new drives
      // For edit mode, we'll be more lenient
      if (!isEditMode) {
        const selectedDate = new Date(drive.date)
        const minDate = new Date()
        minDate.setDate(minDate.getDate() + 15)

        if (selectedDate < minDate) {
          newErrors.date = "Vaccination drive must be scheduled at least 15 days in advance"
        }
      }
    }

    if (!drive.availableDoses) {
      newErrors.availableDoses = "Available doses is required"
    } else if (isNaN(drive.availableDoses) || Number.parseInt(drive.availableDoses) < 1) {
      newErrors.availableDoses = "Available doses must be at least 1"
    }

    if (drive.applicableClasses.length === 0) {
      newErrors.applicableClasses = "At least one class must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setDrive((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleClassToggle = (classValue) => {
    setDrive((prev) => {
      const isSelected = prev.applicableClasses.includes(classValue)

      if (isSelected) {
        // Remove class if already selected
        return {
          ...prev,
          applicableClasses: prev.applicableClasses.filter((c) => c !== classValue),
        }
      } else {
        // Add class if not selected
        return {
          ...prev,
          applicableClasses: [...prev.applicableClasses, classValue],
        }
      }
    })

    // Clear applicable classes error if any class is selected
    if (errors.applicableClasses) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.applicableClasses
        return newErrors
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    try {
      setSubmitting(true)

      // Convert availableDoses to number
      const driveData = {
        ...drive,
        availableDoses: Number(drive.availableDoses),
      }

      console.log("Submitting drive data:", driveData)

      if (isEditMode) {
        await driveService.update(id, driveData)
        toast.success("Vaccination drive updated successfully")
      } else {
        const response = await driveService.create(driveData)
        console.log("Drive created successfully:", response.data)
        toast.success("Vaccination drive scheduled successfully")
      }

      navigate("/drives")
    } catch (err) {
      console.error("Error saving drive:", err)
      const errorMessage = err.response?.data?.message || "An error occurred while saving the vaccination drive"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div>
      <Link to="/drives" className="back-button">
        <i className="fas fa-arrow-left"></i> Back to Vaccination Drives
      </Link>

      <div className="form-container">
        <h1 className="form-title">{isEditMode ? "Edit Vaccination Drive" : "Schedule New Vaccination Drive"}</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="form-section-title">Drive Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="vaccineName">
                  <i className="fas fa-syringe"></i> Vaccine Name
                </label>
                <input
                  type="text"
                  id="vaccineName"
                  name="vaccineName"
                  value={drive.vaccineName}
                  onChange={handleChange}
                  className={errors.vaccineName ? "input-error" : ""}
                  placeholder="Enter vaccine name"
                />
                {errors.vaccineName && <div className="error-message">{errors.vaccineName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="date">
                  <i className="fas fa-calendar-alt"></i> Scheduled Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={drive.date}
                  onChange={handleChange}
                  className={errors.date ? "input-error" : ""}
                />
                {errors.date ? (
                  <div className="error-message">{errors.date}</div>
                ) : (
                  <div className="helper-text">Vaccination drives must be scheduled at least 15 days in advance</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="availableDoses">Available Doses</label>
                <input
                  type="number"
                  id="availableDoses"
                  name="availableDoses"
                  value={drive.availableDoses}
                  onChange={handleChange}
                  className={errors.availableDoses ? "input-error" : ""}
                  min="1"
                  placeholder="Enter number of available doses"
                />
                {errors.availableDoses && <div className="error-message">{errors.availableDoses}</div>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Applicable Classes</h2>
            <div className="class-selection-container">
              <div className="class-selection">
                {availableClasses.map((classValue) => (
                  <button
                    key={classValue}
                    type="button"
                    onClick={() => handleClassToggle(classValue)}
                    className={`class-button ${drive.applicableClasses.includes(classValue) ? "selected" : ""}`}
                  >
                    Class {classValue}
                  </button>
                ))}
              </div>
              {errors.applicableClasses && <div className="error-message">{errors.applicableClasses}</div>}
              <div className="class-selection-help">
                Click on the classes that are eligible for this vaccination drive
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/drives")}
              className="btn btn-secondary"
              disabled={submitting}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <i className="fas fa-save"></i>{" "}
              {submitting ? "Saving..." : isEditMode ? "Update Drive" : "Schedule Drive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DriveForm
