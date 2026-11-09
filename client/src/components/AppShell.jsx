import { NavLink, Outlet, Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import NotificationBell from "./NotificationBell";
import useAuth from "../context/useAuth";

// Shared blue/white header and navigation used by the student, company and admin areas.
export default function AppShell({ links, home, withBell = true }) {
  const { user } = useAuth();

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to={home} className="brand">
            <span className="brand-mark">IP</span>
            Internship &amp; Placement Portal
          </Link>
          <nav className="topnav" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="topbar-right">
            {withBell && <NotificationBell />}
            {user && (
              <span className="user-chip">
                {user.name} <span className="role-pill">{user.role}</span>
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="page">
        <Outlet />
      </div>
    </>
  );
}
