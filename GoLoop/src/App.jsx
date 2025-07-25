import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/landingPage/Home";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import Dashboard from "./components/layout/Dashboard";
import AdminDashboard from "./components/layout/AdminDashboard";
import Events from "./pages/user/Events";
import CreateEventPage from "./pages/user/CreateEventPage";
import MyEventsPage from "./pages/user/MyEventsPage";
import EventDetailPage from "./pages/user/EventDetailPage";
import ManageParticipantsPage from "./pages/user/ManageParticipantsPage";
import Leaderboard from "./pages/user/Leaderboard";
import Profile from "./pages/user/Profile";
import Admin from "./pages/admin/Admin";
import Home1 from "./pages/user/Home1";
import KenaliSampah from "./pages/user/KenaliSampah"
import EventCreatedSuccess from "./pages/user/EventCreatedSuccess";


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* User Dashboard */}
        <Route element={<Dashboard />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/home1" element={<Home1 />} />
          <Route path="/create-event" element={<CreateEventPage />} />
          <Route path="/my-event" element={<MyEventsPage />} />
          <Route path="/event/:eventId" element={<EventDetailPage />} />
          <Route path="/event-create" element={<EventCreatedSuccess />} />
          <Route
            path="/my-event/participants/:eventId"
            element={<ManageParticipantsPage />}
          />
          <Route
            path="/leaderboard"
            element={<Leaderboard />}
          />
          <Route path="/dashboard" element={<Events />} />
          <Route path="/kenali-sampah" element={<KenaliSampah />} />
        </Route>

        {/* Admin Dashboard */}
        <Route element={<AdminDashboard />}>
          <Route path="/admindashboard" element={<Admin />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
