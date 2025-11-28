import React from "react";
import Header from "./components/header";

export default function App() {
  return (
    <>
      <Header />
      <main className="page-content">
        <div className="app">
          <header className="app-header">
            <h1>Welcome to Vite + React</h1>
            <p className="lead">A minimal starter (no template)</p>
            <button className="btn">Click me</button>
          </header>
        </div>
      </main>
    </>
  );
}
