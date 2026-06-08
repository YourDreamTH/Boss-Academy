const db = require("./database/database.js");

// =====================
// REGISTER
// =====================
function register(username, password) {
    return new Promise((resolve, reject) => {

        // กัน username ซ้ำ
        const existing = db.prepare(
            "SELECT id FROM users WHERE username = ?"
        ).get(username);

        if (existing) {
            return resolve({
                success: false,
                message: "Username already exists"
            });
        }

        try {
            const result = db.prepare(`
                INSERT INTO users (username, password, xp, level, role, avatar, hidden)
                VALUES (?, ?, 0, 1, 'user', 'default.png', 0)
            `).run(username, password);

            resolve({
                success: true,
                message: "Register success",
                userId: result.lastInsertRowid
            });

        } catch (err) {
            reject(err.message);
        }
    });
}

// =====================
// LOGIN
// =====================
function login(username, password) {
    return new Promise((resolve, reject) => {

        try {
            const user = db.prepare(
                "SELECT * FROM users WHERE username = ? AND password = ?"
            ).get(username, password);

            if (!user) {
                return resolve({
                    success: false,
                    message: "Login failed"
                });
            }

            resolve({
                success: true,
                message: "Login success",
                user
            });

        } catch (err) {
            reject(err.message);
        }
    });
}

module.exports = { register, login };