import { Routes, Route, Navigate } from "react-router-dom";
import { getToken } from "./utils/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentRegistration from "./pages/StudentRegistration";
import CompanyRegistration from "./pages/CompanyRegistration";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./components/StudentLayout";
import CompanyLayout from "./components/CompanyLayout";
import AdminLayout from "./components/AdminLayout";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import BrowseInternships from "./pages/BrowseInternships";
import MyApplications from "./pages/MyApplications";
import AptitudeTests from "./pages/AptitudeTests";
import TakeTest from "./pages/TakeTest";
import Analytics from "./pages/Analytics";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyProfile from "./pages/CompanyProfile";
import PostInternship from "./pages/PostInternship";
import CompanyInternships from "./pages/CompanyInternships";
import Applicants from "./pages/Applicants";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQuestions from "./pages/AdminQuestions";
import AdminTestConfiguration from "./pages/AdminTestConfiguration";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-register" element={<StudentRegistration />} />
      <Route path="/company-register" element={<CompanyRegistration />} />

      {/* Student area */}
      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile token={getToken()} />} />
          <Route path="internships" element={<BrowseInternships token={getToken()} />} />
          <Route path="applications" element={<MyApplications token={getToken()} />} />
          <Route path="tests" element={<AptitudeTests token={getToken()} />} />
          <Route path="tests/:id" element={<TakeTest token={getToken()} />} />
          <Route path="analytics" element={<Analytics token={getToken()} />} />
        </Route>
      </Route>

      {/* Company area */}
      <Route element={<ProtectedRoute role="company" />}>
        <Route path="/company" element={<CompanyLayout />}>
          <Route index element={<CompanyDashboard />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="post" element={<PostInternship />} />
          <Route path="internships" element={<CompanyInternships />} />
          <Route path="internships/:id/applicants" element={<Applicants />} />
        </Route>
      </Route>

      {/* Admin area */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="tests" element={<AdminTestConfiguration />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
