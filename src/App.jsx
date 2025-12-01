import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/header";
import LandingPage from "./main/landingpage";
import Footer from "./components/footer";
import ErrorBoundary from "./components/ErrorBoundary";
import FirstBanner from "./components/firstbanner";
import AboutUs from "./main/aboutus";
import Contact from "./main/contact";
import "./styles/styles.css";

export default function App() {
  return (
    <div className="app-root">
      <ErrorBoundary>
        <Header />
        <FirstBanner />

        <main className="page-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <Footer />
      </ErrorBoundary>
    </div>
  );
}
