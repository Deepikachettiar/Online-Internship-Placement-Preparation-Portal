const test = require("node:test");
const assert = require("node:assert/strict");
const { validateCompanyProfile } = require("./companyValidation");

test("accepts valid company profile", () => {
  assert.equal(
    validateCompanyProfile({
      companyName: "Acme Corp",
      companyDescription: "Building next gen tech",
      location: "Bengaluru",
      industry: "Software",
      website: "https://acme.example.com",
      logoUrl: "https://acme.example.com/logo.png",
    }),
    null
  );
});

test("accepts empty optional URLs", () => {
  assert.equal(
    validateCompanyProfile({
      companyName: "Acme Corp",
      website: "",
      logoUrl: "",
    }),
    null
  );
});

test("rejects empty company name", () => {
  assert.ok(validateCompanyProfile({ companyName: "" }));
  assert.ok(validateCompanyProfile({ companyName: "   " }));
});

test("rejects invalid website or logo URL", () => {
  assert.ok(validateCompanyProfile({ website: "not-a-valid-url" }));
  assert.ok(validateCompanyProfile({ logoUrl: "invalid-logo" }));
});
