import React from "react";
import "../styles/landingpage.css";

export default function LandingPage() {
	return (
    
			<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="landing-hero">
				<p className="hero-pretext">Welcome to EMO AI</p>
				<h2 className="hero-title">EMO AI: Wear Your Emotions, Crafted by AI.</h2>
				<p className="hero-sub">Artfully transform emotions into wearable stories by AI, reflecting your deepest self in every hue and pattern.</p>
			</div>
			<div className="landing-wrapper">
				<div className="left-stack">
					<div className="side-panel first-panel">Panel 1</div>
					<div className="side-panel second-panel">Panel 2</div>
					<div className="side-panel third-panel">Panel 3</div>
				</div>
				<div className="landing-panel glass flex flex-col justify-center items-center">
					<h1 className="landing-title">EMOWEB</h1>
					<p className="text-gray-600">This is a simple white panel with a shadow.</p>
				</div>
			</div>
		</div>
	);
}

