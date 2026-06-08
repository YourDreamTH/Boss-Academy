const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const db = require("./database/database");
const { register, login } = require("./auth");

const app = express();
let bossHP = 100;
let onlineUsers = {};
if (!fs.existsSync("public/uploads")) {
    fs.mkdirSync("public/uploads", { recursive: true });
}
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.static("public"));
app.use("/upload", express.static("public/uploads"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });
app.post("/game/reset", (req, res) => {
    bossHP = 100;
    res.json({ success: true, bossHP });
});

app.post("/game/submit", (req, res) => {

    const { userId, questionId, answer } = req.body;
   
    prepare().get(
        "SELECT answer FROM questions WHERE id = ?",
        [questionId],
        (err, q) => {

            if (err || !q) {
                return res.json({
                    success: false
                });
            }

            const isCorrect = q.answer === answer;

            if (!isCorrect) {
                return res.json({
                    success: true,
                    correct: false,
                    bossHP
                });
            }

            bossHP = Math.max(0, bossHP - 10);

           prepare().get(
                "SELECT xp, level FROM users WHERE id = ?",
                [userId],
                (err2, user) => {

                    if (!user) {
                        return res.json({
                            success: false
                        });
                    }

                    let newXP = user.xp + 10;
                    let newLevel = user.level;

                    if (newXP >= 300) {
                        newLevel++;
                        newXP -= 300;
                    }

                    prepare().run(
                        "UPDATE users SET xp=?, level=? WHERE id=?",
                        [newXP, newLevel, userId]
                    );

                    res.json({
                        success: true,
                        correct: true,
                        bossHP,
                        xp: newXP,
                        level: newLevel
                    });
                }
            );
        }
    );
});
app.get("/questions", (req, res) => {

   prepare().all(
        "SELECT * FROM questions ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false
                });
            }

            res.json(rows);
        }
    );
});
app.put("/questions/:id", (req, res) => {

    const {
        question,
        answer,
        difficulty,
        option1,
        option2,
        option3,
        option4
    } = req.body;

   prepare().run(
        `
        UPDATE questions
        SET question=?,
            answer=?,
            difficulty=?,
            option1=?,
            option2=?,
            option3=?,
            option4=?
        WHERE id=?
        `,
        [
            question,
            answer,
            difficulty,
            option1,
            option2,
            option3,
            option4,
            req.params.id
        ],
        function (err) {

            if (err) {
                return res.json({
                    success: false
                });
            }

            res.json({
                success: true
            });
        }
    );
});
app.delete("/questions/:id", (req, res) => {

  prepare().run(
        "DELETE FROM questions WHERE id=?",
        [req.params.id],
        function (err) {

            if (err) {
                return res.json({
                    success: false
                });
            }

            res.json({
                success: true
            });
        }
    );
});
app.post("/upload-avatar", upload.single("avatar"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({ success: false });
    }

    const userId = req.body.userId;
    const avatar = req.file.filename;

   prepare().run(
        "UPDATE users SET avatar = ? WHERE id = ?",
        [avatar, userId],
        (err) => {

            if (err) {
                return res.status(500).json({ success: false });
            }

            res.json({
                success: true,
                avatar
            });
        }
    );
});
// =====================
// PROFILE
// =====================
app.get("/profile/:id", (req, res) => {
  prepare().get(
        "SELECT * FROM users WHERE id = ?",
        [req.params.id],
        (err, user) => {
            if (err || !user) {
                return res.json({ success: false });
            }
            res.json(user);
        }
    );
});
app.get("/question/random", (req, res) => {
   prepare().get(
        "SELECT * FROM questions ORDER BY RANDOM() LIMIT 1",
        [],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: "No question" });
            res.json(row);
        }
    );
});
app.get("/leaderboard", (req, res) => {

    const sql = `
        SELECT
            id,
            username,
            xp,
            level,
            avatar
        FROM users
        WHERE role != 'admin'
        AND hidden = 0
        ORDER BY level DESC, xp DESC
        LIMIT 10
    `;

  prepare().all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});
// app.post("/upload-avatar", upload.single("avatar"), async (req, res) => {

//     const userId = req.body.userId;
//     const filename = req.file.filename;


//     if (!user) {
//         return res.json({ success: false });
//     }

//     // 💣 ต้องมีบรรทัดนี้ (สำคัญมาก)
//     user.avatar = filename;
//     await user.save();

//     res.json({
//         success: true,
//         avatar: filename
//     });
// });


app.post("/login", async (req, res) => {
    try {
        const result = await login(req.body.username, req.body.password);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err });
    }
});

app.post("/register", async (req, res) => {
    try {
        const result = await register(req.body.username, req.body.password);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err });
    }
});
app.post("/online", (req, res) => {

    const { userId } = req.body;

    onlineUsers[userId] = Date.now();

    res.json({
        success: true
    });

});
app.get("/online-users", (req, res) => {
    res.json(onlineUsers);
});
app.get("/online-users", (req, res) => {

    const ids = Object.keys(onlineUsers);

    if (ids.length === 0) {
        return res.json([]);
    }

    const placeholders = ids.map(() => "?").join(",");

   prepare().all(
        `SELECT id, username, level, avatar
         FROM users
         WHERE id IN (${placeholders})`,
        ids,
        (err, rows) => {

            if (err) {
                return res.status(500).json([]);
            }

            res.json(rows);
        }
    );
});
app.post("/questions", (req, res) => {

    const {
        question,
        answer,
        option1,
        option2,
        option3,
        option4,
        difficulty
    } = req.body;

  prepare().run(
        `
        INSERT INTO questions
        (
            question,
            answer,
            difficulty,
            option1,
            option2,
            option3,
            option4
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            question,
            answer,
            difficulty,
            option1,
            option2,
            option3,
            option4
        ],
        function (err) {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );
});
app.get("/users", (req, res) => {

  prepare().all(
        `
        SELECT
            id,
            username,
            level,
            xp,
            role,
            avatar,
            hidden
        FROM users
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false
                });
            }

            res.json(rows);
        }
    );

});
app.delete("/users/:id", (req, res) => {

   prepare().get(
        "SELECT role FROM users WHERE id = ?",
        [req.params.id],
        (err, user) => {

            if (err || !user) {
                return res.status(404).json({
                    success: false
                });
            }

            if (user.role === "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Cannot delete admin"
                });
            }

          prepare().run(
                "DELETE FROM users WHERE id = ?",
                [req.params.id],
                function (err) {

                    if (err) {
                        return res.status(500).json({
                            success: false
                        });
                    }

                    res.json({
                        success: true
                    });

                }
            );
        }
    );
});
app.put("/users/hide/:id", (req, res) => {
    const id = req.params.id;

    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(id);

    if (!user) {
        return res.status(404).json({ success: false });
    }

    if (user.role === "admin") {
        return res.status(403).json({
            success: false,
            message: "Cannot hide admin"
        });
    }

    try {
        db.prepare("UPDATE users SET hidden = 1 WHERE id = ?").run(id);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});
app.put("/users/unhide/:id", (req, res) => {

  prepare().run(
        "UPDATE users SET hidden = 0 WHERE id=?",
        [req.params.id],
        function (err) {

            if (err) {
                return res.json({
                    success: false
                });
            }

            res.json({
                success: true
            });

        }
    );

});
setInterval(() => {

    const now = Date.now();

    Object.keys(onlineUsers).forEach(id => {

        if (now - onlineUsers[id] > 30000) {
            delete onlineUsers[id];
        }

    });

}, 10000);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
//     app.listen(3000, () => {
//     console.log("Server running on http://localhost:3000/");
// });