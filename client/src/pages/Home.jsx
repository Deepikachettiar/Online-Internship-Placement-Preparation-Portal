import { Link } from "react-router-dom";
import { getToken, homeFor } from "../utils/auth";

function savedRole() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.role;
  } catch {
    return null;
  }
}

const features = [
  ["🔎", "Find internships", "Search and filter verified openings by skill, location, work mode and stipend."],
  ["✅", "Know your eligibility", "See instantly whether your CGPA and skills match before you apply."],
  ["📝", "Practise aptitude tests", "Timed tests with scores and analytics to track your preparation."],
  ["🏢", "Hire with confidence", "Approved companies post roles, review applicants and shortlist talent."],
];

export default function Home() {
  const loggedIn = Boolean(getToken());

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">IP</span>
            Internship &amp; Placement Portal
          </Link>
          <div className="topbar-right">
            {loggedIn ? (
              <Link className="btn" to={homeFor(savedRole())}>Go to my dashboard</Link>
            ) : (
              <Link className="btn" to="/login">Login</Link>
            )}
          </div>
        </div>
      </header>

      <div className="page">
        <section className="hero" style={{ border: "none", marginTop: 0 }}>
          <h1>Launch your career with the right internship</h1>
          <p>
            One platform for students, companies and placement cells to find
            opportunities, apply, and prepare for placements.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-lg" to="/student-register">I am a student</Link>
            <Link className="btn btn-lg btn-ghost" to="/company-register">I am a company</Link>
          </div>
        </section>

        <div className="feature-grid">
          {features.map(([icon, title, text]) => (
            <div className="feature" key={title}>
              <div className="icon">{icon}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
