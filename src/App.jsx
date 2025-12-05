import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/header";
import LandingPage from "./main/landingpage";
import Footer from "./components/footer";
import ErrorBoundary from "./components/ErrorBoundary";
import FirstBanner from "./components/firstbanner";
import AboutUs from "./main/aboutus";
import Contact from "./main/contact";
import Terms from "./main/terms";
import Privacy from "./main/privacy";
import SignForm from "./backend/signform";
import Regiform from "./backend/regiform";
import UserDash from "./backend/dashboards/userdash/userdash";

import "./styles/styles.css";

export default function App() {
  const location = useLocation();

  return (
    <div className="app-root">
      <ErrorBoundary>
        <Header />

        <main className="page-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/signform" element={<SignForm />} />
            <Route path="/register" element={<Regiform />} />
            <Route path="/userdash" element={<UserDash />} />
          </Routes>
        </main>

        <Footer />
      </ErrorBoundary>
    </div>
  );
}
