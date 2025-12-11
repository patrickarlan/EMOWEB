import React from "react";
import "../styles/contact.css";
import "../styles/styles.css";

export default function Contact() {
  return (
    <main className="contact-page page-section" aria-labelledby="contact-heading">
      <div className="contact-inner">
        <h2 id="contact-heading" className="contact-title">Get in touch</h2>
        <p className="contact-sub">Have questions about EMO AI or want to collaborate? Reach out — we respond to most inquiries within 48 hours.</p>

        <section className="contact-grid" role="region" aria-label="Contact methods">
          <div className="contact-card">
            <h3 className="card-title"><span className="gradient">Direct</span> Contact</h3>
            <p className="contact-line"><strong>Phone:</strong> <a href="tel:+639694743114">+63 969 474 3114</a></p>
            <p className="contact-line"><strong>Email:</strong> <a href="mailto:emowebai@gmail.com">emowebai@gmail.com</a></p>
            <p className="contact-line"><strong>Location:</strong> Shenzhen, China</p>
            <p className="contact-line"><strong>Office hours:</strong> Mon–Fri • 09:00–17:00 (PHT)</p>
          <br></br>
            <h3 className="card-title"><span className="gradient">Connect</span> Online</h3>
            <p className="contact-line"><strong>Twitter:</strong> <a href="https://twitter.com/" target="_blank" rel="noreferrer">@emowebai</a></p>
            <p className="contact-line"><strong>GitHub:</strong> <a href="https://github.com/exampleorg/emoweb" target="_blank" rel="noreferrer">github.com/your-org/emoweb</a></p>
            <p className="contact-line"><strong>Docs / Demo:</strong> <a href="#">Documentation & demo</a></p>
          </div>

          <aside className="contact-card contact-form" aria-labelledby="form-heading">
            <h3 id="form-heading" className="card-title">Send a message</h3>
            <form onSubmit={(e)=>{ e.preventDefault(); alert('Demo: form submission disabled. Replace with real handler.'); }}>
              <label className="sr-only" htmlFor="c-name">Name</label>
              <input id="c-name" className="input" type="text" placeholder="Your name" />

              <label className="sr-only" htmlFor="c-email">Email</label>
              <input id="c-email" className="input" type="email" placeholder="you@domain.com" />

              <label className="sr-only" htmlFor="c-message">Message</label>
              <textarea id="c-message" className="input input-text" placeholder="Tell us a bit about your project or question" rows={4}></textarea>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Send message</button>
                <button type="button" className="btn-ghost" onClick={()=>{ document.getElementById('c-name').value=''; document.getElementById('c-email').value=''; document.getElementById('c-message').value=''; }}>Clear</button>
              </div>
              <p className="muted small">This demo form is client-side only. Replace the handler to connect to your backend or email service.</p>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}
