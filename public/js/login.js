async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        console.log(data);

        if (data.success) {

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            // Admin
            if (data.user.role === "admin") {

                window.location.href = "/admin/dashboard.html";

            }
            // User ปกติ
            else {

                window.location.href = "index.html";

            }

        } else {

            alert(data.message || "Login Failed");

        }

    } catch (err) {

        console.error(err);
        alert("Server Error");

    }
}