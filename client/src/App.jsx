
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
import AptitudeTests from "./pages/AptitudeTests";
import TakeTest from "./pages/TakeTest";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQuestions from "./pages/AdminQuestions";
import AdminTestConfiguration from "./pages/AdminTestConfiguration";
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

      {/* Student area */}
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
          <Route
            path="tests"
            element={<AptitudeTests token={getToken()} />}
          />
          <Route
            path="tests/:id"
            element={<TakeTest token={getToken()} />}
          />
          <Route
            path="analytics"
            element={<Analytics token={getToken()} />}
          />
        </Route>
      </Route>

      {/* Admin area */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/questions"
          element={<AdminQuestions />}
        />
        <Route
          path="/admin/tests"
          element={<AdminTestConfiguration />}
        />
      </Route>
    </Routes>
  );
}

export default App;
