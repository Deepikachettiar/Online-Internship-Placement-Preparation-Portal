
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./App.css";

function App() {
  const [apiStatus, setApiStatus] = useState("Not checked");

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
      <h1>Online Internship & Placement Preparation Portal</h1>
      <p>
        Your platform for internship opportunities and placement preparation.
      </p>

      <nav>
        <Link to="/student-register">Student Registration</Link>
        {" | "}
        <Link to="/company-register">Company Registration</Link>
        {" | "}
        <Link to="/login">Login</Link>
      </nav>

      <section>
        <h2>Backend Connection</h2>
        <button onClick={checkApi}>Check API Health</button>
        <p role="status">{apiStatus}</p>
      </section>
    </main>
  );
}

export default App;