const avatar = document.getElementById("avatar");
const avatarInput = document.getElementById("avatarInput");

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}

// =========================
// โหลดข้อมูลโปรไฟล์
// =========================
async function loadProfile() {

    try {

        const res = await fetch(`/profile/${user.id}?t=${Date.now()}`);
        const profile = await res.json();

        document.getElementById("username").textContent = profile.username || "-";
        document.getElementById("level").textContent = "Level: " + (profile.level ?? 1);
        document.getElementById("xp").textContent = "XP: " + (profile.xp ?? 0);

        if (profile.avatar) {
            avatar.src = profile.avatar + "?t=" + Date.now();
        } else {
            avatar.src = "/image/default-avatar.png";
        }

    } catch (err) {
        console.error(err);
    }
}

avatarInput.addEventListener("change", async () => {

    const file = avatarInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user.id); // FIX ตรงนี้

    try {
        const res = await fetch("/upload-avatar", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (data.success) {
            avatar.src = data.avatar + "?t=" + Date.now();
            user.avatar = data.avatar;
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            console.log("Upload failed:", data.message);
        }

    } catch (err) {
        console.error("Upload error:", err);
    }
});
// =========================
// ปุ่มกลับหน้า home
// =========================
document.getElementById("homeBtn")
    .addEventListener("click", () => {
        window.location.href = "index.html";
    });

// โหลดตอนเปิดหน้า
loadProfile();