import React from "react";
import { Outlet } from "react-router-dom";
import NavbarDashboard from "../common/NavbarDashboard";

function Dashboard() {
  return (
    <>
      <NavbarDashboard />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Dashboard;
