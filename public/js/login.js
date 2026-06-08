function login(username, password) {
    return new Promise((resolve, reject) => {
        try {
            const user = db.prepare(
                "SELECT id, username, role, avatar, level, xp FROM users WHERE username=? AND password=?"
            ).get(username, password);

            if (!user) {
                return resolve({
                    success: false,
                    message: "Login failed"
                });
            }

            resolve({
                success: true,
                user
            });

        } catch (err) {
            reject(err.message);
        }
    });
}