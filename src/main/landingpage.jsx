import React from "react";
import "../styles/landingpage.css";

export default function LandingPage() {
	return (
		<div className="min-h-screen pt-12 flex items-center justify-center p-4">
			<div className="landing-panel flex flex-col justify-center items-center">
				<h2 className="text-2xl font-bold mb-4">Welcome to EMOWEB</h2>
				<p className="text-gray-600">This is a simple white panel with a shadow.</p>
			</div>
		</div>
	);
}

