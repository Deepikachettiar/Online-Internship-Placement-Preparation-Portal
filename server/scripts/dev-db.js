// Starts a local MongoDB on port 27017 without Docker.
// Data is kept in server/.data so it survives restarts.
const path = require("path");
const fs = require("fs");
const { MongoMemoryServer } = require("mongodb-memory-server");

const dbPath = path.join(__dirname, "..", ".data");
fs.mkdirSync(dbPath, { recursive: true });

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, ip: "127.0.0.1", dbPath, storageEngine: "wiredTiger" },
  });
  console.log("Local MongoDB ready at", mongod.getUri());

  const stop = async () => {
    await mongod.stop({ doCleanup: false });
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((error) => {
  console.error("Could not start local MongoDB:", error.message);
  process.exit(1);
});
