import React from "react";
import { Outlet } from "react-router-dom";
import NavbarAdmin from "../common/NavbarAdmin";

function AdminDashboard() {
  return (
    <>
      <NavbarAdmin />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default  AdminDashboard;
