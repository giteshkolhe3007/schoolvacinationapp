"use client"

import { useAuth } from "../hooks/useAuth"
import { Navigate, Outlet } from "react-router-dom"
import Spinner from "./Spinner"
import Layout from "./Layout"

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Spinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default PrivateRoute
