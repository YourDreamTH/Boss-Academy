async function loadUsers() {

    const res = await fetch("/users");
    const users = await res.json();

    const table =
        document.getElementById("userTable");

    table.innerHTML = "";

    users.forEach(user => {

        table.innerHTML += `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.level}</td>
            <td>${user.xp}</td>
            <td>${user.hidden ? "Hidden" : "Visible"}</td>
            <td>
                ${
                    user.hidden
                    ? `<button class="show"
                        onclick="unhideUser(${user.id})">
                        Show
                       </button>`
                    : `<button class="hide"
                        onclick="hideUser(${user.id})">
                        Hide
                       </button>`
                }

                ${
                    user.role === "admin"
                    ? "🔒 Protected"
                    : `<button class="delete"
                        onclick="deleteUser(${user.id})">
                        Delete
                       </button>`
                }
            </td>
        </tr>
        `;
    });
}
async function hideUser(id) {

    await fetch(
        `/users/hide/${id}`,
        {
            method: "PUT"
        }
    );

    loadUsers();
}

async function unhideUser(id) {

    await fetch(
        `/users/unhide/${id}`,
        {
            method: "PUT"
        }
    );

    loadUsers();
}

async function deleteUser(id) {

    if (!confirm("Delete user?")) return;

    await fetch(
        `/users/${id}`,
        {
            method: "DELETE"
        }
    );

    loadUsers();
}

loadUsers();