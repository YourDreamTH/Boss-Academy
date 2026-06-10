async function loadLeaderboard() {
    try {
        const res = await fetch("/leaderboard?ts=" + Date.now());

        if (!res.ok) {
            throw new Error("HTTP Error: " + res.status);
        }

        const data = await res.json();

        const body = document.getElementById("leaderboardBody");

        if (!body) return;

        body.innerHTML = "";

        if (!data || data.length === 0) {
            body.innerHTML = `<tr><td colspan="4">No data</td></tr>`;
            return;
        }

        data.forEach((user, index) => {

            let medal = "";
            if (index === 0) medal = "🥇";
            else if (index === 1) medal = "🥈";
            else if (index === 2) medal = "🥉";

            body.innerHTML += `
                <tr class="row">
                    <td class="rank">${medal} ${index + 1}</td>

                    <td class="player">
                        <img class="avatar"
                            src="${user.avatar
                            ? user.avatar
                            : '/image/default-avatar.png'
                }"
                        <span>${user.username || "Unknown"}</span>
                    </td>

                    <td>${user.level ?? 1}</td>
                    <td>${user.xp ?? 0}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Leaderboard error:", err);
    }
}

loadLeaderboard();