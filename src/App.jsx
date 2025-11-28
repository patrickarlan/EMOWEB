import React from "react";
import Header from "./components/header";
import LandingPage from "./main/landingpage";
import Footer from "./components/footer";
import "./styles/styles.css";

export default function App() {
  return (
    <div className="app-root">
      <Header />

      <main className="page-content">
        <LandingPage />
      </main>

      <Footer />
    </div>
  );
}
