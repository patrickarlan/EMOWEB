import React, { useState } from "react";
import USSidebar from "./USsidebar";
import ProfileSettings from "./components/ProfileSettings";
import AccountSettings from "./components/AccountSettings";
import "../userdash/userdash.css";

export default function UserDash() {
    const [activePanel, setActivePanel] = useState("profile");

    return (
        <div className="userdash-layout">
            <USSidebar activePanel={activePanel} setActivePanel={setActivePanel} />

            <main className="userdash-main">
                <section className="userdash-grid" aria-label="User dashboard panels">
                    <article 
                        className={`dash-box ${activePanel === "profile" ? "active" : ""}`}
                        onClick={() => setActivePanel("profile")}
                    >
                        <h2 className="dash-title">Profile</h2>
                        <p className="dash-desc">View and edit your profile information.</p>
                    </article>

                    <article className="dash-box">
                        <h2 className="dash-title">Orders</h2>
                        <p className="dash-desc">Recent orders and updates.</p>
                    </article>

                    <article 
                        className={`dash-box ${activePanel === "settings" ? "active" : ""}`}
                        onClick={() => setActivePanel("settings")}
                    >
                        <h2 className="dash-title">Settings</h2>
                        <p className="dash-desc">Account settings and preferences.</p>
                    </article>

                    <article className="dash-box">
                        <h2 className="dash-title">Activity</h2>
                        <p className="dash-desc">Recent activity and logs.</p>
                    </article>
                    {/* Detail panel placed as a grid child so it lines up with the fourth column on wide screens */}
                    <section className="dash-detail" aria-label="Detail panel">
                        <div className="dash-detail-inner">
                            {activePanel === "profile" && <ProfileSettings />}
                            {activePanel === "settings" && <AccountSettings />}
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}
