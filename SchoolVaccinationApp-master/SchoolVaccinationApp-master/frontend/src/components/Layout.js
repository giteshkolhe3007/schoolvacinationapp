"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path) => {
    return location.pathname === path ? "active" : ""
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>School Vaccination Portal</h1>
          {user && (
            <div className="user-info">
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="main-container">
        <nav className="sidebar">
          <ul className="nav-menu">
            <li className={isActive("/")}>
              <Link to="/">
                <i className="fas fa-home"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive("/students")}>
              <Link to="/students">
                <i className="fas fa-user-graduate"></i>
                <span>Students</span>
              </Link>
            </li>
            <li className={isActive("/drives")}>
              <Link to="/drives">
                <i className="fas fa-syringe"></i>
                <span>Vaccination Drives</span>
              </Link>
            </li>
            <li className={isActive("/reports")}>
              <Link to="/reports">
                <i className="fas fa-chart-bar"></i>
                <span>Reports</span>
              </Link>
            </li>
          </ul>
        </nav>

        <main className="content">{children}</main>
      </div>
    </div>
  )
}

export default Layout
