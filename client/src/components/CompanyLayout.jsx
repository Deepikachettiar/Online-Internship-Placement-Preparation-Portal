import AppShell from "./AppShell";

const links = [
  { to: "/company", label: "Dashboard", end: true },
  { to: "/company/profile", label: "Company Profile" },
  { to: "/company/post", label: "Post Internship" },
  { to: "/company/internships", label: "My Listings" },
];

export default function CompanyLayout() {
  return <AppShell links={links} home="/company" />;
}
