async function register() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (!username || !password) {

        document.getElementById("result").textContent =
            "Please fill all fields";

        return;
    }

    if (password !== confirmPassword) {

        document.getElementById("result").textContent =
            "Passwords do not match";

        return;
    }

    try {

        const response = await fetch("/register", {
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

        document.getElementById("result").textContent =
            data.message;

        if (data.success) {

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);

        }

    } catch (err) {

        document.getElementById("result").textContent =
            "Server error";

        console.error(err);

    }

}