import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Branch from "./pages/Branch";
import Category from "./pages/Category";
import Product from "./pages/Product";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes - Overview */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Branch */}
        <Route
          path="/dashboard/branch/:branchId"
          element={
            <ProtectedRoute>
              <Layout>
                <Branch />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Category */}
        <Route
          path="/dashboard/branch/:branchId/category/:categoryId"
          element={
            <ProtectedRoute>
              <Layout>
                <Category />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Product */}
        <Route
          path="/dashboard/branch/:branchId/category/:categoryId/product/:productId"
          element={
            <ProtectedRoute>
              <Layout>
                <Product />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;