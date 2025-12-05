import React from 'react';
import { Outlet } from 'react-router-dom';

export default function UserLayout() {
  return (
    // No global header/footer here — dashboard provides its own sidebar/header
    <div className="user-layout">
      <Outlet />
    </div>
  );
}
