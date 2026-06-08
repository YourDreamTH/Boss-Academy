const db = require("./database.js");

db.all("PRAGMA table_info(questions)", [], (err, rows) => {
    console.log(rows);
});