const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("DB Error:", err.message);
    } else {
        console.log("Connected DB:", dbPath);
        db.run("PRAGMA journal_mode=WAL;");
    }
});

console.log("DB PATH =", dbPath);
module.exports = db;