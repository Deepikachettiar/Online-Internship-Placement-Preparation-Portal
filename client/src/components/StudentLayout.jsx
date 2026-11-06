import AppShell from "./AppShell";

const links = [
  { to: "/student", label: "Dashboard", end: true },
  { to: "/student/profile", label: "My Profile" },
  { to: "/student/internships", label: "Internships" },
  { to: "/student/applications", label: "My Applications" },
  { to: "/student/tests", label: "Aptitude Tests" },
  { to: "/student/analytics", label: "My Analytics" },
];

export default function StudentLayout() {
  return <AppShell links={links} home="/student" />;
}
