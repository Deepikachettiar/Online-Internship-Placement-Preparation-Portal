import ApplyButton from "./ApplyButton";

export default function InternshipCard({ internship, studentToken, onApplied }) {
  if (!internship) return null;

  const company = internship.company || {};
  const companyDisplayName =
    typeof company === "object" ? company.companyName || company.name : "Company";
  const companyLogo = typeof company === "object" ? company.logoUrl : null;
  const companyLocation =
    (typeof company === "object" ? company.location : null) || internship.location || "Location not specified";
  const companyIndustry = typeof company === "object" ? company.industry : null;

  return (
    <article
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1.25rem",
        marginBottom: "1rem",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        {companyLogo && (
          <img
            src={companyLogo}
            alt={`${companyDisplayName} logo`}
            style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "4px" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <div>
          <h3 style={{ margin: "0 0 0.25rem 0" }}>{internship.title}</h3>
          <p style={{ margin: 0, color: "#4a5568", fontSize: "0.95rem" }}>
            <strong>{companyDisplayName}</strong>
            {companyIndustry && ` • ${companyIndustry}`}
            {` • ${companyLocation}`}
          </p>
        </div>
      </div>

      {internship.description && (
        <p style={{ margin: "0.5rem 0", color: "#2d3748" }}>{internship.description}</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", margin: "0.75rem 0" }}>
        {internship.stipend !== undefined && (
          <span style={{ background: "#edf2f7", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem" }}>
            💰 Stipend: {internship.stipend ? `₹${internship.stipend}/mo` : "Unpaid"}
          </span>
        )}
        {internship.minCGPA !== undefined && internship.minCGPA > 0 && (
          <span style={{ background: "#edf2f7", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem" }}>
            🎓 Min CGPA: {internship.minCGPA}
          </span>
        )}
        {internship.workMode && (
          <span style={{ background: "#edf2f7", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem" }}>
            📍 {internship.workMode}
          </span>
        )}
        {internship.deadline && (
          <span style={{ background: "#edf2f7", padding: "0.2rem 0.6rem", borderRadius: "4px", fontSize: "0.85rem" }}>
            ⏳ Deadline: {new Date(internship.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {Array.isArray(internship.requiredSkills) && internship.requiredSkills.length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#718096" }}>Skills: </span>
          {internship.requiredSkills.map((skill, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-block",
                background: "#e2e8f0",
                color: "#2d3748",
                padding: "0.15rem 0.5rem",
                borderRadius: "3px",
                fontSize: "0.8rem",
                marginRight: "0.35rem",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {studentToken && (
        <div style={{ marginTop: "1rem" }}>
          <ApplyButton
            internshipId={internship._id}
            token={studentToken}
            onApplied={onApplied}
          />
        </div>
      )}
    </article>
  );
}
