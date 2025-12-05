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
                        <h2 className="dash-title">Orders</h2>
                        <p className="dash-desc">Recent orders and updates.</p>
                    </article>

                    <article className="dash-box">
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
                            <h3 className="dd-title">Details</h3>
                            <p className="dd-desc">Select a panel above to view more details here. This area will expand with the relevant content when you click any of the dashboard boxes (orders, profile, settings, activity).</p>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}
