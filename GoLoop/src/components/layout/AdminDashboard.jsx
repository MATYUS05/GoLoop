import React from "react";
import { Outlet } from "react-router-dom";
import NavbarAdmin from "../common/NavbarAdmin";
import AdminEventCompletionReviewPage from "../../pages/admin/AdminEventCompletionReviewPage";

function AdminDashboard() {
  return (
    <>
      <NavbarAdmin />
      <main>
        <Outlet />
        <AdminEventCompletionReviewPage />
      </main>
    </>
  );
}

export default  AdminDashboard;
