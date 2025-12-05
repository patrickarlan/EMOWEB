import React from "react";
import USSidebar from "./USsidebar";
import "../userdash/userdash.css";

export default function UserDash() {
    return (
        <div className="userdash-layout">
            <USSidebar />

            <main className="userdash-main">
                <section className="userdash-grid" aria-label="User dashboard panels">
                    <article className="dash-box">
                        <h2 className="dash-title">Profile</h2>
                        <p className="dash-desc">View and edit your profile information.</p>
                    </article>

                    <article className="dash-box">
                        <h2 className="dash-title">Messages</h2>
                        <p className="dash-desc">Recent messages and notifications.</p>
                    </article>

                    <article className="dash-box">
                        <h2 className="dash-title">Settings</h2>
                        <p className="dash-desc">Account settings and preferences.</p>
                    </article>

                    <article className="dash-box">
                        <h2 className="dash-title">Activity</h2>
                        <p className="dash-desc">Recent activity and logs.</p>
                    </article>
                </section>
            </main>
        </div>
    );
}
