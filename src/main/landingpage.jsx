import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landingpage.css";
import emoex from "../pics/EMOEX.png";
import emoex2 from "../pics/EMOEX2.png";
import emoex3 from "../pics/EMOEX3.png";

export default function LandingPage() {
	const [activePanel, setActivePanel] = useState("website");
	const navigate = useNavigate();

	const panelContent = {
		website: {
			title: "Welcome to EMOWEB",
			subtitle: "EMO AI: Wear Your Emotions, Crafted by AI",
			description: "EMOWEB is your gateway to the future of emotional AI robotics. Our platform connects you with cutting-edge EMO robots designed to understand, express, and interact with human emotions in meaningful ways. Whether you're looking for a companion, a learning tool, or an innovative assistant, EMOWEB brings the next generation of AI directly to you.",
			features: [
				"🤖 Advanced emotional recognition technology",
				"💡 Intelligent interaction and learning capabilities",
				"🎨 Customizable personality and responses",
				"🔒 Secure platform with privacy protection",
				"📱 Easy-to-use dashboard and controls"
			]
		},
		robots: {
			title: "Meet Our EMO Robots",
			subtitle: "Three Unique Models for Every Need",
			description: "Each EMO robot is engineered with state-of-the-art AI technology, featuring emotion recognition, voice interaction, and adaptive learning. Choose the model that best fits your lifestyle and needs.",
			models: [
				{
					name: "EMO-S AI ROBOT",
					price: "$67",
					specs: "Perfect for beginners and enthusiasts. Compact design with essential emotional AI features.",
					features: ["Basic emotion recognition", "Voice commands", "4-hour battery life"]
				},
				{
					name: "EMO AI PROTOTYPE",
					price: "$40",
					specs: "Affordable entry-level model ideal for learning and exploration.",
					features: ["Standard AI processing", "Educational mode", "Lightweight design"]
				},
				{
					name: "EMO AI PRO",
					price: "$95",
					specs: "Premium model with advanced capabilities and extended features.",
					features: ["Advanced emotion AI", "Extended battery", "Premium sensors"]
				}
			]
		},
		manual: {
			title: "EMO Prototype Manual",
			subtitle: "Everything You Need to Get Started",
			description: "Learn how to set up, operate, and maximize your EMO robot experience. Our comprehensive manual covers installation, features, troubleshooting, and advanced configurations.",
			sections: [
				"Quick Start Guide - Get your EMO running in minutes",
				"Feature Overview - Explore all capabilities",
				"Voice Commands - Full command reference",
				"Troubleshooting - Common issues and solutions",
				"Advanced Settings - Customize your experience"
			]
		}
	};

	const panels = [
		{ id: "website", label: "About EMOWEB", image: emoex, color: "first-panel" },
		{ id: "robots", label: "EMO Robots", image: emoex2, color: "second-panel" },
		{ id: "manual", label: "User Manual", image: emoex3, color: "third-panel" }
	];

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="landing-hero">
				<p className="hero-pretext">Welcome to EMO AI</p>
				<h2 className="hero-title">EMO AI: Wear Your Emotions, Crafted by AI.</h2>
				<p className="hero-sub">Artfully transform emotions into wearable stories by AI, reflecting your deepest self in every hue and pattern.</p>
			</div>
			<div className="landing-wrapper">
				<div className="left-stack">
					{panels.map((panel) => (
						<div 
							key={panel.id}
							className={`side-panel ${panel.color} ${activePanel === panel.id ? 'active' : ''}`}
							onClick={() => setActivePanel(panel.id)}
						>
							<div className="panel-content">
								<img src={panel.image} alt={panel.label} className="panel-image" />
								<span className="panel-label">{panel.label}</span>
							</div>
						</div>
					))}
				</div>
				<div className="landing-panel glass">
					<div className="panel-detail-content">
						{activePanel === "website" && (
							<>
								<h1 className="landing-title">{panelContent.website.title}</h1>
								<h3 className="detail-subtitle">{panelContent.website.subtitle}</h3>
								<p className="detail-description">{panelContent.website.description}</p>
								<div className="features-list">
									{panelContent.website.features.map((feature, idx) => (
										<div key={idx} className="feature-item">{feature}</div>
									))}
								</div>
							</>
						)}

						{activePanel === "robots" && (
							<>
								<h1 className="landing-title">{panelContent.robots.title}</h1>
								<h3 className="detail-subtitle">{panelContent.robots.subtitle}</h3>
								<p className="detail-description">{panelContent.robots.description}</p>
								<div className="models-grid">
									{panelContent.robots.models.map((model, idx) => (
										<div 
											key={idx} 
											className="model-card"
											onClick={() => navigate('/products')}
										>
											<h4 className="model-name">{model.name}</h4>
											<div className="model-price">{model.price}</div>
											<p className="model-specs">{model.specs}</p>
											<ul className="model-features">
												{model.features.map((feat, i) => (
													<li key={i}>{feat}</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</>
						)}

						{activePanel === "manual" && (
							<>
								<h1 className="landing-title">{panelContent.manual.title}</h1>
								<h3 className="detail-subtitle">{panelContent.manual.subtitle}</h3>
								<p className="detail-description">{panelContent.manual.description}</p>
								<div className="manual-sections">
									{panelContent.manual.sections.map((section, idx) => (
										<div key={idx} className="manual-item">
											<span className="manual-number">{idx + 1}</span>
											<span className="manual-text">{section}</span>
										</div>
									))}
								</div>
								<button className="download-manual-btn">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
									</svg>
									Download Full Manual (PDF)
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

