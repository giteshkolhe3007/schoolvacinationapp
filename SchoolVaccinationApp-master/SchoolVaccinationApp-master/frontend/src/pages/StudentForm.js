"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import { studentService } from "../services/api.service"

const StudentForm = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditMode = !!id

    const [loading, setLoading] = useState(isEditMode)
    const [submitting, setSubmitting] = useState(false)
    const [student, setStudent] = useState({
        name: "",
        studentId: "",
        class: "",
        section: "",
        age: "",
        gender: "",
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isEditMode) {
            const fetchStudent = async () => {
                try {
                    setLoading(true)

                    // Try to fetch from API
                    try {
                        const response = await studentService.getById(id)
                        const { name, studentId, class: studentClass, section, age, gender } = response.data

                        setStudent({
                            name,
                            studentId,
                            class: studentClass,
                            section,
                            age: age.toString(),
                            gender,
                        })
                    } catch (apiError) {
                        console.error("API error:", apiError)
                    }
                } catch (err) {
                    toast.error("Failed to load student data")
                    console.error(err)
                    navigate("/students")
                } finally {
                    setLoading(false)
                }
            }

            fetchStudent()
        }
    }, [id, isEditMode, navigate])

    const validateForm = () => {
        const newErrors = {}

        if (!student.name.trim()) newErrors.name = "Name is required"
        if (!student.studentId.trim()) newErrors.studentId = "Student ID is required"
        if (!student.class) newErrors.class = "Class is required"
        if (!student.section) newErrors.section = "Section is required"

        if (!student.age) {
            newErrors.age = "Age is required"
        } else if (isNaN(student.age) || Number.parseInt(student.age) < 3 || Number.parseInt(student.age) > 20) {
            newErrors.age = "Age must be between 3 and 20"
        }

        if (!student.gender) newErrors.gender = "Gender is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setStudent((prev) => ({
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Please fix the errors in the form")
            return
        }

        try {
            setSubmitting(true)

            // Convert age to number
            const studentData = {
                ...student,
                age: Number(student.age),
            }

            if (isEditMode) {
                try {
                    await studentService.update(id, studentData)
                    toast.success("Student updated successfully")
                } catch (apiError) {
                    console.error("API error:", apiError)
                    // For demo purposes, show success even if API fails
                    toast.error("Failed to update student")
                }
            } else {
                try {
                    await studentService.create(studentData)
                    toast.success("Student added successfully")
                } catch (apiError) {
                    console.error("API error:", apiError)
                    // For demo purposes, show success even if API fails
                    toast.error("Failed to add student")
                }
            }

            navigate("/students")
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An error occurred"
            toast.error(errorMessage)
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="loading">Loading student data...</div>
    }

    return (
        <div>
            <Link to="/students" className="back-button">
                <i className="fas fa-arrow-left"></i> Back to Students
            </Link>

            <div className="form-container">
                <h1 className="form-title">{isEditMode ? "Edit Student" : "Add New Student"}</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h2 className="form-section-title">Personal Information</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={student.name}
                                    onChange={handleChange}
                                    className={errors.name ? "input-error" : ""}
                                    placeholder="Enter student's full name"
                                />
                                {errors.name && <div className="error-message">{errors.name}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="studentId">Student ID</label>
                                <input
                                    type="text"
                                    id="studentId"
                                    name="studentId"
                                    value={student.studentId}
                                    onChange={handleChange}
                                    className={errors.studentId ? "input-error" : ""}
                                    placeholder="Enter student ID"
                                    disabled={isEditMode}
                                />
                                {errors.studentId && <div className="error-message">{errors.studentId}</div>}
                                {isEditMode && <div className="helper-text">Student ID cannot be changed</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={student.age}
                                    onChange={handleChange}
                                    min="3"
                                    max="20"
                                    className={errors.age ? "input-error" : ""}
                                    placeholder="Enter age"
                                />
                                {errors.age && <div className="error-message">{errors.age}</div>}
                                <div className="helper-text">Student must be between 3 and 20 years old</div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={student.gender}
                                    onChange={handleChange}
                                    className={errors.gender ? "input-error" : ""}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <div className="error-message">{errors.gender}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2 className="form-section-title">Academic Information</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="class">Class</label>
                                <select
                                    id="class"
                                    name="class"
                                    value={student.class}
                                    onChange={handleChange}
                                    className={errors.class ? "input-error" : ""}
                                >
                                    <option value="">Select Class</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={(i + 1).toString()}>
                                            Class {i + 1}
                                        </option>
                                    ))}
                                </select>
                                {errors.class && <div className="error-message">{errors.class}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="section">Section</label>
                                <select
                                    id="section"
                                    name="section"
                                    value={student.section}
                                    onChange={handleChange}
                                    className={errors.section ? "input-error" : ""}
                                >
                                    <option value="">Select Section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                                {errors.section && <div className="error-message">{errors.section}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate("/students")}
                            className="btn btn-secondary"
                            disabled={submitting}
                        >
                            <i className="fas fa-times"></i> Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            <i className="fas fa-save"></i> {submitting ? "Saving..." : isEditMode ? "Update Student" : "Add Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default StudentForm
