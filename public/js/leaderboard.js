async function loadLeaderboard() {
    try {
        const res = await fetch("/leaderboard?ts=" + Date.now());

        if (!res.ok) {
            throw new Error("HTTP Error: " + res.status);
        }

        const data = await res.json();

        const body = document.getElementById("leaderboardBody");

        if (!body) {
            console.error("❌ leaderboardBody not found in HTML");
            return;
        }

        body.innerHTML = "";

        data.forEach((user, index) => {

            let medal = "";
            if (index === 0) medal = "🥇";
            else if (index === 1) medal = "🥈";
            else if (index === 2) medal = "🥉";

            const row = `
                <tr class="row">
                    <td class="rank">${medal} ${index + 1}</td>

                    <td class="player">
                       <img class="avatar"
                        src="${user.avatar
                    ? '/uploads/' + user.avatar + '?v=' + Date.now()
                    : '/image/default-avatar.png'}">
                         <span>${user.username || "Unknown"}</span>
                     </td>

                    <td>${user.level}</td>
                    <td>${user.xp}</td>
                </tr>
            `;

            body.innerHTML += row;
        });

    } catch (err) {
        console.error("Leaderboard error:", err);
    }
}

loadLeaderboard();