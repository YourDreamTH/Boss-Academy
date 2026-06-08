const db = require("./database.js");

db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log(rows);
    }
});