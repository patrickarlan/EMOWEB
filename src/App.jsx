import React from "react";
import Header from "./components/header";
import LandingPage from "./main/landingpage";
import Footer from "./components/footer";
import ErrorBoundary from "./components/ErrorBoundary";
import FirstBanner from "./components/firstbanner";
import "./styles/styles.css";

export default function App() {
  return (
    <div className="app-root">
      <ErrorBoundary>
        <Header />
        <FirstBanner />
        <main className="page-content">
          <LandingPage />
        </main>

        <Footer />
      </ErrorBoundary>
    </div>
  );
}
