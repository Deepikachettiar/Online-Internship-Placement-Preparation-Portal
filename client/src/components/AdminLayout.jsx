import AppShell from "./AppShell";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/questions", label: "Question Bank" },
  { to: "/admin/tests", label: "Test Configuration" },
];

export default function AdminLayout() {
  return <AppShell links={links} home="/admin" withBell={false} />;
}
