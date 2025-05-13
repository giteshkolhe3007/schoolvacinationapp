"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { reportService } from "../services/api.service"
import Spinner from "../components/Spinner"

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        vaccinatedStudents: 0,
        vaccinationPercentage: 0,
        upcomingDrives: [],
        recentDrives: [],
        vaccineStats: [],
        classwiseStats: [],
        monthlyTrend: [],
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await reportService.getDashboardStats()

                // If we have data, update the state
                if (response && response.data) {
                    setStats(response.data)
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
                setError("Failed to load dashboard data. Please try again later.")

            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return <Spinner />
    }

    return (
        <div className="dashboard">
            <h2 className="page-title">Dashboard</h2>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon students-icon">
                        <i className="fas fa-user-graduate"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Total Students</h3>
                        <p className="stat-value">{stats.totalStudents}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon vaccinated-icon">
                        <i className="fas fa-syringe"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Vaccinated Students</h3>
                        <p className="stat-value">{stats.vaccinatedStudents}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon rate-icon">
                        <i className="fas fa-chart-pie"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Vaccination Rate</h3>
                        <p className="stat-value">{stats.vaccinationPercentage}%</p>
                    </div>
                </div>
            </div>

            <div className="upcoming-drives">
                <div className="section-header">
                    <h3>Upcoming Vaccination Drives</h3>
                    <Link to="/drives/add" className="btn btn-primary">
                        <i className="fas fa-plus"></i> Schedule New Drive
                    </Link>
                </div>

                <div className="table-container">
                    {stats.upcomingDrives && stats.upcomingDrives.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vaccine Name</th>
                                    <th>Date</th>
                                    <th>Available Doses</th>
                                    <th>Applicable Classes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.upcomingDrives.map((drive) => (
                                    <tr key={drive._id}>
                                        <td>{drive.vaccineName}</td>
                                        <td>{new Date(drive.date).toLocaleDateString()}</td>
                                        <td>{drive.availableDoses}</td>
                                        <td>{drive.applicableClasses.join(", ")}</td>
                                        <td>
                                            <Link to={`/drives/${drive._id}`} className="btn btn-sm btn-info">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-data">
                            <p>No upcoming vaccination drives scheduled.</p>
                            <Link to="/drives/add" className="btn btn-primary">
                                <i className="fas fa-plus"></i> Schedule New Drive
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <div className="quick-links-container" style={{ marginTop: "20px" }}>
                <div className="section-header">
                    <h3>Quick Links</h3>
                </div>
                <div className="quick-links" style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                    <Link to="/students" className="btn btn-primary">
                        <i className="fas fa-user-graduate"></i> Manage Students
                    </Link>
                    <Link to="/drives" className="btn btn-info">
                        <i className="fas fa-syringe"></i> Vaccination Drives
                    </Link>
                    <Link to="/reports" className="btn btn-secondary">
                        <i className="fas fa-chart-bar"></i> View Reports
                    </Link>
                </div>
            </div>

            {/* Recent Vaccination Drives */}
            {stats.recentDrives && stats.recentDrives.length > 0 && (
                <div className="upcoming-drives mt-6">
                    <div className="section-header">
                        <h3>Recent Vaccination Drives</h3>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vaccine Name</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentDrives.map((drive) => (
                                    <tr key={drive._id}>
                                        <td>{drive.vaccineName}</td>
                                        <td>{new Date(drive.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className="status-badge vaccinated">{drive.status}</span>
                                        </td>
                                        <td>
                                            <Link to={`/drives/${drive._id}`} className="btn btn-sm btn-info">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vaccine Statistics */}
            {stats.vaccineStats && stats.vaccineStats.length > 0 && (
                <div className="upcoming-drives mt-6">
                    <div className="section-header">
                        <h3>Vaccination Statistics by Vaccine</h3>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Vaccine Name</th>
                                    <th>Number of Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.vaccineStats.map((stat, index) => (
                                    <tr key={index}>
                                        <td>{stat._id}</td>
                                        <td>{stat.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
