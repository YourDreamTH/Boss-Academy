const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "database.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

console.log("Connected DB:", dbPath);

module.exports = db;