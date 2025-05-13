import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import PrivateRoute from "./components/PrivateRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import StudentList from "./pages/StudentList"
import StudentForm from "./pages/StudentForm"
import StudentImport from "./pages/StudentImport"
import StudentDetails from "./pages/StudentDetails"
import VaccinationDrives from "./pages/VaccinationDrives"
import DriveForm from "./pages/DriveForm"
import DriveDetails from "./pages/DriveDetails"
import Reports from "./pages/Reports"

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />

            {/* Student Routes */}
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/add" element={<StudentForm />} />
            <Route path="/students/:id" element={<StudentDetails />} />
            <Route path="/students/:id/edit" element={<StudentForm />} />
            <Route path="/students/import" element={<StudentImport />} />

            {/* Drive Routes */}
            <Route path="/drives" element={<VaccinationDrives />} />
            <Route path="/drives/add" element={<DriveForm />} />
            <Route path="/drives/:id" element={<DriveDetails />} />
            <Route path="/drives/edit/:id" element={<DriveForm />} />

            {/* Reports Route */}
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
