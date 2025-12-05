import React from "react";
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

import MainLayout from "./layouts/MainLayout";
import UserLayout from "./layouts/UserLayout";

import LandingPage from "./main/landingpage";
import AboutUs from "./main/aboutus";
import Contact from "./main/contact";
import Terms from "./main/terms";
import Privacy from "./main/privacy";
import SignForm from "./backend/signform";
import ProtectedRoute from "./backend/utilities/ProtectedRoute";
import Regiform from "./backend/regiform";
import UserDash from "./backend/dashboards/userdash/userdash";
import RequireAuth from "./backend/utilities/RequireAuth";

import "./styles/styles.css";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Main site routes use MainLayout (header + footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/signform" element={<ProtectedRoute><SignForm /></ProtectedRoute>} />
          <Route path="/register" element={<Regiform />} />
        </Route>

        {/* User area uses UserLayout (no header/footer) */}
        <Route element={<UserLayout />}>
          <Route path="/userdash" element={<RequireAuth><UserDash /></RequireAuth>} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
