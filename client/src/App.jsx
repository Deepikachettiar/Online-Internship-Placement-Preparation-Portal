import { useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import axios from "axios";
import LogoutButton from "./components/LogoutButton";
import { getToken } from "./utils/auth";
import CompanyRegistration from "./pages/CompanyRegistration";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import BrowseInternships from "./pages/BrowseInternships";
import MyApplications from "./pages/MyApplications";
import "./App.css";

function Home() {
  const [apiStatus, setApiStatus] = useState("Not checked");
  const [loggedIn, setLoggedIn] = useState(Boolean(getToken()));

  async function checkApi() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/health`
      );
      setApiStatus(response.data.message);
    } catch {
      setApiStatus("Backend unavailable. Make sure the server is running.");
    }
  }

  return (
    <main>
      <h1>Online Internship &amp; Placement Preparation Portal</h1>
      <p>
        Your platform for internship opportunities and placement preparation.
      </p>

      <nav>
        <Link to="/student-register">Student Registration</Link>
        {" | "}
        <Link to="/company-register">Company Registration</Link>
        {" | "}
        <Link to="/login">Login</Link>
        {" | "}
        <Link to="/student">Student Dashboard</Link>
        {loggedIn && (
          <>
            {" | "}
            <LogoutButton onLogout={() => setLoggedIn(false)} />
          </>
        )}
      </nav>

      <section>
        <h2>Backend Connection</h2>
        <button onClick={checkApi}>Check API Health</button>
        <p role="status">{apiStatus}</p>
      </section>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/company-register"
        element={<CompanyRegistration />}
      />

      {/* Student area: requires login with the student role */}
      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route
            path="profile"
            element={<StudentProfile token={getToken()} />}
          />
          <Route
            path="internships"
            element={<BrowseInternships token={getToken()} />}
          />
          <Route
            path="applications"
            element={<MyApplications token={getToken()} />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;