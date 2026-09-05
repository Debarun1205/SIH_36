import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RegisterOfficial from "./pages/RegisterOfficial.jsx";

import VerifyQR from "./pages/public/VerifyQR.jsx";
import SubmitComplaint from "./pages/public/SubmitComplaint.jsx";

import UserDashboard from "./pages/user/UserDashboard.jsx";
import RegisterShop from "./pages/user/RegisterShop.jsx";
import ShopDetail from "./pages/user/ShopDetail.jsx";

import CitizenDashboard from "./pages/citizen/CitizenDashboard.jsx";

import InspectorDashboard from "./pages/inspector/InspectorDashboard.jsx";
import CompleteInspection from "./pages/inspector/CompleteInspection.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-official" element={<RegisterOfficial />} />
          <Route path="/verify" element={<VerifyQR />} />
          <Route path="/verify/:type/:id" element={<VerifyQR />} />
          <Route path="/complaint" element={<SubmitComplaint />} />

          <Route
            path="/user"
            element={
              <ProtectedRoute roles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/register-shop"
            element={
              <ProtectedRoute roles={["user"]}>
                <RegisterShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/shops/:id"
            element={
              <ProtectedRoute roles={["user"]}>
                <ShopDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/citizen"
            element={
              <ProtectedRoute roles={["citizen"]}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inspector"
            element={
              <ProtectedRoute roles={["inspector"]}>
                <InspectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspector/inspections/:id"
            element={
              <ProtectedRoute roles={["inspector"]}>
                <CompleteInspection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-ink/40">
        MaanDrishti — SIH prototype for online verification of weighing &amp; measuring instruments
      </footer>
      <ChatWidget />
    </div>
  );
}
