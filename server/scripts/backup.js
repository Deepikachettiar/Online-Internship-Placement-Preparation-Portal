
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("Error: MONGO_URI is missing from server/.env");
  process.exit(1);
}

const backupDir = path.join(__dirname, "..", "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = path.join(backupDir, `backup-${timestamp}`);

fs.mkdirSync(outputDir, { recursive: true });

execFile(
  "mongodump",
  ["--uri", mongoUri, "--out", outputDir],
  (error, stdout, stderr) => {
    if (error) {
      console.error("Backup failed:", error.message);
      process.exitCode = 1;
      return;
    }

    console.log("Database backup completed successfully!");
    console.log(`Backup location: ${outputDir}`);

    if (stderr) {
      console.log(stderr);
    }
  }
);
