require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Internship = require("./models/Internship");
const Question = require("./models/Question");
const AptitudeTest = require("./models/AptitudeTest");

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to server/.env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  // Seed is idempotent by email/title/category: rerunning updates the sample records.
  const users = [
    { name: "Portal Admin", email: "admin@example.com", password: "DemoPass123!", role: "admin" },
    { name: "Aarav Student", email: "aarav@example.com", password: "DemoPass123!", role: "student", cgpa: 8.2, skills: ["JavaScript", "React", "Node.js"] },
    { name: "Diya Student", email: "diya@example.com", password: "DemoPass123!", role: "student", cgpa: 7.6, skills: ["Python", "SQL"] },
    { name: "Ishaan Student", email: "ishaan@example.com", password: "DemoPass123!", role: "student", cgpa: 8.8, skills: ["Java", "Spring Boot"] },
    { name: "Meera Student", email: "meera@example.com", password: "DemoPass123!", role: "student", cgpa: 7.9, skills: ["HTML", "CSS", "React"] },
    { name: "Northstar Tech", email: "northstar@example.com", password: "DemoPass123!", role: "company", companyName: "Northstar Tech", companyApproved: true },
    { name: "Bluepeak Systems", email: "bluepeak@example.com", password: "DemoPass123!", role: "company", companyName: "Bluepeak Systems", companyApproved: true },
    { name: "Orbit Labs", email: "orbit@example.com", password: "DemoPass123!", role: "company", companyName: "Orbit Labs", companyApproved: true },
  ];

  const userDocs = [];
  for (const user of users) {
    const saved = await User.findOneAndUpdate(
      { email: user.email },
      { $set: user },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userDocs.push(saved);
  }

  const companies = userDocs.filter((user) => user.role === "company");
  const internships = [
    ["Frontend Developer Intern", "Build accessible React interfaces.", 7.0, ["JavaScript", "React"]],
    ["Backend Developer Intern", "Build REST APIs and services.", 7.5, ["Node.js", "SQL"]],
    ["Cloud Engineering Intern", "Support cloud infrastructure projects.", 7.0, ["Linux", "Cloud"]],
    ["Data Analyst Intern", "Analyze datasets and communicate insights.", 7.0, ["Python", "SQL"]],
    ["QA Automation Intern", "Develop and maintain automated tests.", 6.5, ["JavaScript", "Testing"]],
    ["Full Stack Intern", "Contribute across the web application stack.", 7.5, ["React", "Node.js"]],
    ["Java Developer Intern", "Build Java services.", 7.0, ["Java", "Spring Boot"]],
    ["DevOps Intern", "Improve CI/CD and deployment workflows.", 7.0, ["Linux", "Git"]],
    ["AI Research Intern", "Prototype machine-learning workflows.", 8.0, ["Python", "Machine Learning"]],
    ["Product Engineering Intern", "Collaborate on product features.", 7.0, ["JavaScript", "Git"]],
  ];

  const internshipDocs = [];
  for (let index = 0; index < internships.length; index += 1) {
    const [title, description, minCGPA, requiredSkills] = internships[index];
    const company = companies[index % companies.length];
    const saved = await Internship.findOneAndUpdate(
      { title },
      {
        $set: {
          title, description, minCGPA, requiredSkills,
          company: company._id,
          location: "Bengaluru",
          status: "approved",
          isPublished: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    internshipDocs.push(saved);
  }

  const questionData = [
    { category: "Quant", question: "If 12 items cost ₹240, what is the cost of 5 items?", options: ["₹80", "₹100", "₹120", "₹140"], answer: "₹100" },
    { category: "Quant", question: "What is 20% of 350?", options: ["50", "60", "70", "80"], answer: "70" },
    { category: "Quant", question: "A train travels 120 km in 2 hours. What is its average speed?", options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"], answer: "60 km/h" },
    { category: "Logical", question: "Find the next number: 2, 4, 8, 16, __.", options: ["18", "24", "30", "32"], answer: "32" },
    { category: "Logical", question: "Which item does not belong: circle, square, triangle, carrot?", options: ["Circle", "Square", "Triangle", "Carrot"], answer: "Carrot" },
    { category: "Logical", question: "If all roses are flowers, which statement must be true?", options: ["All flowers are roses", "All roses are flowers", "No roses are flowers", "All flowers are red"], answer: "All roses are flowers" },
    { category: "Verbal", question: "Choose the closest meaning of 'concise'.", options: ["Brief", "Confusing", "Lengthy", "Unclear"], answer: "Brief" },
    { category: "Verbal", question: "Choose the grammatically correct sentence.", options: ["She go to class", "She goes to class", "She going class", "She gone to class"], answer: "She goes to class" },
    { category: "Verbal", question: "Choose the opposite of 'expand'.", options: ["Increase", "Extend", "Contract", "Enlarge"], answer: "Contract" },
  ];

  const questionDocs = [];
  for (const item of questionData) {
    const saved = await Question.findOneAndUpdate(
      { question: item.question },
      { $set: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    questionDocs.push(saved);
  }

  await AptitudeTest.findOneAndUpdate(
    { title: "Sprint 1 Sample Aptitude Test" },
    {
      $set: {
        title: "Sprint 1 Sample Aptitude Test",
        description: "Published sample assessment covering Quant, Logical, and Verbal aptitude.",
        questions: questionDocs.map((question) => question._id),
        status: "published",
        isPublished: true,
        durationMinutes: 15,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Seed complete: 1 admin, 4 students, 3 approved companies, 10 internships, 9 questions, 1 published test.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
