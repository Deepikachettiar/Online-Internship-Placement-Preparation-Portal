export default function ApplicantProfile({ applicant }) {
  if (!applicant) return <p>No applicant selected.</p>;

  return (
    <section aria-labelledby="applicant-profile-title">
      <h2 id="applicant-profile-title">Applicant Profile</h2>
      <dl>
        <dt>Name</dt><dd>{applicant.name || "—"}</dd>
        <dt>Email</dt><dd>{applicant.email || "—"}</dd>
        <dt>CGPA</dt><dd>{applicant.cgpa ?? "—"}</dd>
        <dt>Skills</dt><dd>{Array.isArray(applicant.skills) ? applicant.skills.join(", ") : "—"}</dd>
      </dl>
    </section>
  );
}
