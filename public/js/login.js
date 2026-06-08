async function login() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

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

        if (data.user.role === "admin") {

            window.location.href =
                "/admin/dashboard.html";

        } else {

            window.location.href =
                "/index.html";

        }

    }
    else {

        document.getElementById("result")
            .textContent = data.message;

    }
}