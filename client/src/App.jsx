
import { useState } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import axios from "axios";
import LogoutButton from "./components/LogoutButton";
import { getToken } from "./utils/auth";
import CompanyRegistration from "./pages/CompanyRegistration";
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
      <Route
        path="/company-register"
        element={<CompanyRegistration />}
      />
    </Routes>
  );
}

export default App;
