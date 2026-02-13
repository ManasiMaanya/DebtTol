import React from "react";
import ScrollToTop from "./components/ScrollToTop";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";   // Overview page
import Branch from "./pages/Branch";
import Category from "./pages/Category";
import Product from "./pages/Product";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Overview */}
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

        {/* Branch */}
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

        {/* Category */}
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

        {/* Product */}
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