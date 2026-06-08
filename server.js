const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const db = require("./database/database");
const { register, login } = require("./auth");

const app = express();

// =====================
// STATE
// =====================
let bossHP = 100;
let onlineUsers = {};

// =====================
// INIT FOLDER
// =====================
const uploadDir = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static(uploadDir));

// =====================
// MULTER
// =====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// =====================
// GAME
// =====================
app.post("/game/reset", (req, res) => {
    bossHP = 100;
    res.json({ success: true, bossHP });
});

app.post("/game/submit", (req, res) => {
    const { userId, questionId, answer } = req.body;

    const q = db.prepare("SELECT answer FROM questions WHERE id=?").get(questionId);
    if (!q) return res.json({ success: false });

    if (q.answer !== answer) {
        return res.json({ success: true, correct: false, bossHP });
    }

    bossHP = Math.max(0, bossHP - 10);

    const user = db.prepare("SELECT xp, level FROM users WHERE id=?").get(userId);
    if (!user) return res.json({ success: false });

    let newXP = (user.xp || 0) + 10;
    let newLevel = user.level || 1;

    if (newXP >= 300) {
        newLevel++;
        newXP -= 300;
    }

    db.prepare("UPDATE users SET xp=?, level=? WHERE id=?")
        .run(newXP, newLevel, userId);

    res.json({
        success: true,
        correct: true,
        bossHP,
        xp: newXP,
        level: newLevel
    });
});

app.post("/upload-avatar", upload.single("avatar"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const filePath = "/uploads/" + req.file.filename;

        // ถ้าคุณมี userId ส่งมาด้วย
        const userId = req.body.userId;

        if (userId) {
            db.prepare("UPDATE users SET avatar=? WHERE id=?")
                .run(filePath, userId);
        }

        res.json({
            success: true,
            avatar: filePath
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/questions", (req, res) => {
    const rows = db.prepare("SELECT * FROM questions ORDER BY id DESC").all();
    res.json(rows);
});

app.get("/question/random", (req, res) => {
    const row = db.prepare("SELECT * FROM questions ORDER BY RANDOM() LIMIT 1").get();
    res.json(row || {});
});

app.post("/questions", (req, res) => {
    const { question, answer, option1, option2, option3, option4, difficulty } = req.body;

    try {
        const result = db.prepare(`
            INSERT INTO questions
            (question, answer, difficulty, option1, option2, option3, option4)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            question,
            answer,
            difficulty,
            option1,
            option2,
            option3,
            option4
        );

        res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put("/questions/:id", (req, res) => {
    const { question, answer, difficulty, option1, option2, option3, option4 } = req.body;

    db.prepare(`
        UPDATE questions
        SET question=?, answer=?, difficulty=?, option1=?, option2=?, option3=?, option4=?
        WHERE id=?
    `).run(
        question,
        answer,
        difficulty,
        option1,
        option2,
        option3,
        option4,
        req.params.id
    );

    res.json({ success: true });
});

app.delete("/questions/:id", (req, res) => {
    db.prepare("DELETE FROM questions WHERE id=?").run(req.params.id);
    res.json({ success: true });
});

// =====================
// USERS
// =====================
app.get("/users", (req, res) => {
    const rows = db.prepare(`
        SELECT id, username, level, xp, role, avatar, hidden
        FROM users
        ORDER BY id DESC
    `).all();

    res.json(rows);
});

app.delete("/users/:id", (req, res) => {
    const user = db.prepare("SELECT role FROM users WHERE id=?").get(req.params.id);

    if (!user) return res.status(404).json({ success: false });

    if (user.role === "admin") {
        return res.status(403).json({ success: false, message: "Cannot delete admin" });
    }

    db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
    res.json({ success: true });
});

app.put("/users/hide/:id", (req, res) => {
    const user = db.prepare("SELECT role FROM users WHERE id=?").get(req.params.id);

    if (!user) return res.status(404).json({ success: false });

    if (user.role === "admin") {
        return res.status(403).json({ success: false });
    }

    db.prepare("UPDATE users SET hidden=1 WHERE id=?").run(req.params.id);
    res.json({ success: true });
});

app.put("/users/unhide/:id", (req, res) => {
    db.prepare("UPDATE users SET hidden=0 WHERE id=?").run(req.params.id);
    res.json({ success: true });
});

// =====================
// PROFILE
// =====================
app.get("/profile/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id);
    res.json(user || { success: false });
});

// =====================
// LEADERBOARD (FIXED)
// =====================
app.get("/leaderboard", (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT
                id,
                username,
                COALESCE(xp, 0) AS xp,
                COALESCE(level, 1) AS level,
                avatar
            FROM users
            WHERE COALESCE(role,'user') != 'admin'
            AND COALESCE(hidden,0) = 0
            ORDER BY level DESC, xp DESC
            LIMIT 10
        `).all();

        if (!rows) return res.json([]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DEBUG
app.get("/debug-users", (req, res) => {
    const rows = db.prepare("SELECT * FROM users").all();
    res.json(rows);
});

// =====================
// AUTH
// =====================
app.post("/login", async (req, res) => {
    try {
        res.json(await login(req.body.username, req.body.password));
    } catch (err) {
        res.status(500).json({ success: false, message: err });
    }
});

app.post("/register", async (req, res) => {
    try {
        res.json(await register(req.body.username, req.body.password));
    } catch (err) {
        res.status(500).json({ success: false, message: err });
    }
});

// =====================
// ONLINE USERS
// =====================
app.post("/online", (req, res) => {
    onlineUsers[req.body.userId] = Date.now();
    res.json({ success: true });
});

app.get("/online-users", (req, res) => {
    const ids = Object.keys(onlineUsers);

    if (ids.length === 0) return res.json([]);

    const placeholders = ids.map(() => "?").join(",");

    const rows = db.prepare(`
        SELECT id, username, level, avatar
        FROM users
        WHERE id IN (${placeholders})
    `).all(ids);

    res.json(rows);
});

// cleanup
setInterval(() => {
    const now = Date.now();

    Object.keys(onlineUsers).forEach(id => {
        if (now - onlineUsers[id] > 30000) {
            delete onlineUsers[id];
        }
    });
}, 10000);

// =====================
// START
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});