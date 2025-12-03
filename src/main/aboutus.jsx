import React from "react";
import "../styles/aboutus.css";
import "../styles/styles.css";

export default function AboutUs() {
  return (
    <main className="about-min page-section" aria-labelledby="about-title">
      <div className="about-inner">
        <div className="kicker">About Us</div>
        <h1 id="about-title" className="about-title">We are <span className="gradient">EMO AI</span></h1>
        <p className="about-lead">EMO AI is an emotion-aware companion robot that recognizes facial expressions and maps them to natural, pet-like responses. It runs real-time, privacy-first inference on-device, expresses emotion through a compact OLED “face” and gentle movements, and adapts interactions to make human-robot communication feel intuitive, safe, and playful.</p>

        <div className="about-illustration" aria-hidden="true">
          {/* lightweight inline illustration to avoid extra assets */}
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <rect x="10" y="50" width="180" height="110" rx="28" fill="#0fb7ff" opacity="0.15" />
            <g transform="translate(40,60)">
              <circle cx="40" cy="30" r="20" fill="#7df" />
              <rect x="10" y="60" width="60" height="20" rx="6" fill="#7df" />
              <circle cx="20" cy="25" r="3" fill="#041226" />
              <circle cx="60" cy="25" r="3" fill="#041226" />
            </g>
          </svg>
        </div>
          <section className="about-features" aria-label="Features">
            <div className="feature">
              <p className="feature-text text-right"><strong>Privacy-first on-device inference.</strong> EMO AI performs lightweight emotion classification locally so raw video frames never need to leave the device. This keeps interactions private, reduces latency, and enables reliable offline behavior for sensitive environments.</p>
              <div className="feature-img" aria-hidden="true">
                <svg viewBox="0 0 64 64" width="160" height="120" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="12" width="60" height="36" rx="6" fill="#0fb7ff" opacity="0.14"/>
                  <circle cx="20" cy="30" r="8" fill="#7df" />
                  <rect x="36" y="24" width="16" height="12" rx="2" fill="#7df" />
                  <path d="M8 10 L56 10" stroke="#7df" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
                </svg>
              </div>
            </div>

            <div className="feature">
              <p className="feature-text text-center"><strong>Adaptive, human-like responses.</strong> The system maps detected emotions to expressive OLED animations and motion patterns that are tuned to be warm and non-threatening. EMO AI learns simple preferences over time to make interactions feel more personal.</p>
              <div className="feature-img" aria-hidden="true">
                <svg viewBox="0 0 64 64" width="260" height="195" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="18" width="52" height="28" rx="8" fill="#8b5cf6" opacity="0.14"/>
                  <circle cx="24" cy="32" r="6" fill="#b7a3ff" />
                  <path d="M40 28 q6 4 0 8" stroke="#b7a3ff" stroke-width="3" stroke-linecap="round" fill="none"/>
                </svg>
              </div>
            </div>

            <div className="feature reverse">
              <div className="feature-img" aria-hidden="true">
                <svg viewBox="0 0 64 64" width="160" height="120" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="14" width="48" height="36" rx="5" fill="#00d1ff" opacity="0.12"/>
                  <path d="M18 36 h28" stroke="#00d1ff" stroke-width="3" stroke-linecap="round"/>
                  <circle cx="28" cy="26" r="4" fill="#00d1ff" />
                </svg>
              </div>
              <p className="feature-text text-left"><strong>Designed for education and research.</strong> EMO AI is lightweight and extensible—ideal for classroom demos, prototyping human-robot interaction studies, and teaching TinyML concepts. It exposes safe telemetry hooks for researchers while remaining simple to deploy.</p>
            </div>
          </section>
      </div>
    </main>
  );
}
