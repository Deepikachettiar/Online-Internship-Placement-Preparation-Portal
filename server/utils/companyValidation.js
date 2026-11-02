// Validates company profile fields.
// Returns an error message or null if valid.

function validateUrlField(value, fieldLabel) {
  if (value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return `${fieldLabel} must be text.`;
  }
  try {
    new URL(value);
    return null;
  } catch {
    return `${fieldLabel} must be a valid URL.`;
  }
}

function validateCompanyProfile({
  companyName,
  companyDescription,
  location,
  industry,
  logoUrl,
  website,
}) {
  if (companyName !== undefined && (typeof companyName !== "string" || !companyName.trim())) {
    return "Company name cannot be empty.";
  }

  if (companyDescription !== undefined && typeof companyDescription !== "string") {
    return "Company description must be text.";
  }

  if (location !== undefined && typeof location !== "string") {
    return "Location must be text.";
  }

  if (industry !== undefined && typeof industry !== "string") {
    return "Industry must be text.";
  }

  const logoError = validateUrlField(logoUrl, "Logo URL");
  if (logoError) return logoError;

  const websiteError = validateUrlField(website, "Website URL");
  if (websiteError) return websiteError;

  return null;
}

module.exports = { validateCompanyProfile };
