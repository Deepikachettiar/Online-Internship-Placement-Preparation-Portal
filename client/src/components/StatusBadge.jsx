const styles = {
  Applied: "status-badge status-applied",
  "Under Review": "status-badge status-review",
  Shortlisted: "status-badge status-shortlisted",
  Rejected: "status-badge status-rejected",
  Selected: "status-badge status-selected",
};

export default function StatusBadge({ status = "Applied" }) {
  return (
    <span className={styles[status] || "status-badge"}>
      {status}
    </span>
  );
}
