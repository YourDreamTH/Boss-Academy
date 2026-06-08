const db = require("./database.js");

db.run("DELETE FROM users", [], (err) => {
    if (err) console.error(err.message);
    else console.log("Users deleted");
});

db.run("DELETE FROM questions", [], (err) => {
    if (err) console.log(err.message);
    else console.log("Questions deleted");
});