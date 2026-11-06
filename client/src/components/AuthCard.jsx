import { Link } from "react-router-dom";

// Centered white card used by the login and registration pages.
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-wrap">
      <main className="auth-card">
        <Link to="/" className="brand">
          <span className="brand-mark">IP</span>
          Internship &amp; Placement Portal
        </Link>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </main>
    </div>
  );
}
