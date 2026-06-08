const db = require("./database.js");

db.all(
    "SELECT * FROM users",
    [],
    (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            console.table(rows);
        }
    }
);