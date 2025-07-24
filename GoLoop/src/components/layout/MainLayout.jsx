import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Wilayah from "../../pages/landingPage/Wilayah";
import About from "../../pages/landingPage/About";

function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
        <Wilayah />
        <About />
      </main>
    </>
  );
}

export default MainLayout;
