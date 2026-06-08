const db = require("./database.js");

// เพิ่ม admin
db.run(
    `INSERT INTO users
    (username, password, xp, level, role)
    VALUES (?, ?, ?, ?, ?)`,
    ["admin", "4321", 0, 1, "admin"],
    function(err){
        if(err){
            console.error(err.message);
        }else{
            console.log("Admin inserted");
        }
    }
);

// เพิ่ม user ปกติ
db.run(
    `INSERT INTO users
    (username, password, xp, level, role)
    VALUES (?, ?, ?, ?, ?)`,
    ["testuser", "1234", 0, 1, "user"],
    function(err){
        if(err){
            console.error(err.message);
        }else{
            console.log("User inserted");
        }
    }
);