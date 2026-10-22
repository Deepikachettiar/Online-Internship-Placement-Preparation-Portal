// Validates company profile fields.
// Returns an error message or null if valid.
function validateCompanyProfile({ companyName, companyDescription, location, industry, logoUrl, website }) {
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

  if (logoUrl !== undefined && logoUrl !== "") {
    if (typeof logoUrl !== "string") return "Logo URL must be text.";
    try {
      new URL(logoUrl);
    } catch {
      return "Logo URL must be a valid URL.";
    }
  }

  if (website !== undefined && website !== "") {
    if (typeof website !== "string") return "Website URL must be text.";
    try {
      new URL(website);
    } catch {
      return "Website URL must be a valid URL.";
    }
  }

  return null;
}

module.exports = { validateCompanyProfile };
