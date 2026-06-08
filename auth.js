const db = require("./database/database.js");

// REGISTER (กัน username ซ้ำแล้ว)
function register(username, password) {
    return new Promise((resolve, reject) => {

        // 1. เช็กก่อนว่ามี user นี้ไหม
        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            (err, row) => {
                if (err) return reject(err.message);

                if (row) {
                    return resolve({
                        success: false,
                        message: "Username already exists"
                    });
                }

                // 2. ถ้ายังไม่มี ค่อย insert
                db.run(
                    `INSERT INTO users (username, password, xp, level)
                     VALUES (?, ?, 0, 1)`,
                    [username, password],
                    function (err) {
                        if (err) return reject(err.message);

                        resolve({
                            success: true,
                            message: "Register success",
                            userId: this.lastID
                        });
                    }
                );
            }
        );
    });
}

// LOGIN
function login(username, password) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM users WHERE username = ? AND password = ?`,
            [username, password],
            (err, row) => {
                if (err) return reject(err.message);

                if (!row) {
                    return resolve({
                        success: false,
                        message: "Login failed"
                    });
                }

                resolve({
                    success: true,
                    message: "Login success",
                    user: row
                });
            }
        );
    });
}

module.exports = { register, login };