const db = require("./database.js");

// db.run(`
// CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     username TEXT UNIQUE,
//     password TEXT,
//     xp INTEGER DEFAULT 0,
//     level INTEGER DEFAULT 1,
//     role TEXT DEFAULT 'user',
//     avatar TEXT DEFAULT 'default-avatar.png'
// )
// `);

// db.run(`
// CREATE TABLE IF NOT EXISTS questions (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     question TEXT,
//     answer TEXT,
//     difficulty TEXT DEFAULT 'easy',
//     option1 TEXT,
//     option2 TEXT,
//     option3 TEXT,
//     option4 TEXT
// )
// `);
db.run(`
    ALTER TABLE users
    ADD COLUMN hidden INTEGER DEFAULT 0
`);
console.log("Tables created");