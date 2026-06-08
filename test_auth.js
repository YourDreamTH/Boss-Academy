const { register, login } = require("./auth");

async function test() {
    console.log("=== REGISTER ===");
    console.log(await register("testuser", "1234"));

    console.log("=== LOGIN ===");
    console.log(await login("testuser", "1234"));

    console.log("=== LOGIN WRONG ===");
    console.log(await login("testuser", "wrongpass"));
}

test();