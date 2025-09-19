const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "..", "data", "pokemon.db");

if (fs.existsSync(dbPath)) {
  console.log("Removing existing DB:", dbPath);
  fs.unlinkSync(dbPath);
}

console.log("Starting app to create fresh DB (require index.js to run)");