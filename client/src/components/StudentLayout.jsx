import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import "./StudentLayout.css";

// Shared header and navigation for every student page.
export default function StudentLayout() {
  return (
    <div className="student-layout">
      <header className="student-header">
        <h1>Internship &amp; Placement Portal</h1>
        <nav className="student-nav" aria-label="Student navigation">
          <NavLink to="/student" end>Dashboard</NavLink>
          <NavLink to="/student/profile">My Profile</NavLink>
          <NavLink to="/student/internships">Internships</NavLink>
          <NavLink to="/student/applications">My Applications</NavLink>
          <LogoutButton />
        </nav>
      </header>

      <div className="student-content">
        <Outlet />
      </div>
    </div>
  );
}
