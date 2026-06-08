console.log("GAME JS LOADED");
let score = 0;
let bossHP = 100;
let combo = 0;
let playerHP = 3;
let isProcessing = false;
let currentQuestion = null;
let timer = 10;
let timerInterval = null;
let isLoadingQuestion = false;
updateHearts();

const user =
    JSON.parse(localStorage.getItem("user"));
const userId = user.id;

async function initGame() {

    const res = await fetch("/game/reset", {
        method: "POST"
    });

    const data = await res.json();

    bossHP = data.bossHP;

    setBossState("idle"); // เพิ่ม

    updateBossHP();
    updateComboUI();
}
async function loadQuestion() {

    if (isLoadingQuestion) return;
    isLoadingQuestion = true;

    try {

        const res = await fetch("/question/random");

        if (!res.ok) {
            console.error("question API fail:", await res.text());
            return;
        }

        const q = await res.json();

        if (!q || !q.id) throw new Error("Invalid question");

        currentQuestion = q;

        document.getElementById("question").innerText = q.question;
        document.getElementById("option1").innerText = q.option1;
        document.getElementById("option2").innerText = q.option2;
        document.getElementById("option3").innerText = q.option3;
        document.getElementById("option4").innerText = q.option4;

        startTimer();

    } catch (err) {
        console.error("loadQuestion error:", err);
    }

    isLoadingQuestion = false;
}
/* =========================
   ANSWER CHECK
========================= */
async function checkAnswer(optionNumber) {
    if (isProcessing) return;

    isProcessing = true;
    clearInterval(timerInterval);

    try {
        const selected =
            document.getElementById("option" + optionNumber).innerText;

        const res = await fetch("/game/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                questionId: currentQuestion.id,
                answer: selected
            })
        });

        const data = await res.json();

        if (typeof data.bossHP === "number") {
            bossHP = data.bossHP;
        }

        if (data.correct) {

    combo++;
    score += 10;

    setBossState("hit");
    bossHitEffect();
    showDamage("-10", "hit");

} else {

    combo = 0;
    playerHP--;

    setBossState("laugh");
    showDamage("-1", "laugh");
    updateHearts();

    if (playerHP <= 0) {

        clearInterval(timerInterval);

        await delay(600);

        showEndCard("YOU LOSE!");

        isProcessing = false;
        return;
    }
}

        updateBossHP();
        updateComboUI();
        document.getElementById("score").innerText = "Score: " + score;

        if (bossHP <= 0) {
            clearInterval(timerInterval);
            setBossState("defeat");
            await delay(600);
            showEndCard("YOU WIN!");
            isProcessing = false;
            return;
        }
        setTimeout(() => setBossState("idle"), 500);
        isProcessing = false;
        loadQuestion();

    } catch (err) {
        console.error(err);
        isProcessing = false;
    }
}

function setBossState(state) {

    const boss = document.getElementById("boss");
    boss.classList.remove(
        "boss-hit-effect",
        "boss-miss-effect",
        "boss-attack-effect"
    );

    void boss.offsetWidth; // reset animation
    if (state === "idle") {
        boss.src = "/image/boss_idle.png";
    }

    if (state === "hit") {
        boss.src = "/image/boss_hit.png";
        boss.classList.add("boss-hit-effect");
    }

    if (state === "laugh") {
        boss.src = "/image/boss_laugh.png";
        boss.classList.add("boss-miss-effect");
    }

    if (state === "attack") {
        boss.src = "/image/boss_attack.png";
        boss.classList.add(
            "boss-attack-effect"
        );
        document.body.classList.add(
            "screen-danger"
        );
        setTimeout(() => {
            document.body.classList.remove(
                "screen-danger"
            );
        }, 600);
    }
    if (state === "defeat") {
        boss.src = "/image/boss_defeat.png";
    }
}

/* =========================
   EFFECT
========================= */
function bossHitEffect() {
    const boss = document.getElementById("boss");

    boss.animate([
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.03)", filter: "brightness(1.8)" },
        { transform: "scale(1)", filter: "brightness(1)" }
    ], {
        duration: 250
    });
}

/* =========================
   UI
========================= */
function updateBossHP() {
    document.getElementById("bossHP").innerText = "Boss HP: " + bossHP;

    const hpBar = document.getElementById("hpBar");
    hpBar.style.width = bossHP + "%";

    if (bossHP > 60) hpBar.style.background = "limegreen";
    else if (bossHP > 30) hpBar.style.background = "orange";
    else hpBar.style.background = "red";
}

function updateComboUI() {
    document.getElementById("combo").innerText = "Combo: " + combo;
}

/* =========================
   DAMAGE TEXT
========================= */
function showDamage(text, type = "hit") {

    const box = document.querySelector(".boss-wrapper");

    const dmg = document.createElement("div");
    dmg.className = "damage " + type;
    dmg.innerText = text;

    const side = Math.random() < 0.5 ? -1 : 1;
    const offsetX = 30 + Math.random() * 20;
    const offsetY = 20;

    const boss = document.getElementById("boss");
    const b = boss.getBoundingClientRect();
    const r = box.getBoundingClientRect();

    const x = b.left - r.left + b.width / 2;
    const y = b.top - r.top + b.height * 0.3;

    dmg.style.left = `${x + side * offsetX}px`;
    dmg.style.top = `${y - offsetY}px`;

    box.appendChild(dmg);

    dmg.animate([
        { transform: "translate(-50%,0)", opacity: 0 },
        { transform: "translate(-50%,-10px)", opacity: 1 },
        { transform: "translate(-50%,-25px)", opacity: 0 }
    ], {
        duration: 800,
        easing: "ease-out"
    });

    setTimeout(() => dmg.remove(), 800);
}

/* =========================
   END CARD
========================= */
function showEndCard(text) {
    const card = document.getElementById("endCard");
    const title = document.getElementById("endText");

    title.innerText = text;
    card.classList.remove("hidden");
}

async function restartGame() {

    document.getElementById("endCard")
        .classList.add("hidden");

    const res = await fetch("/game/reset", {
        method: "POST"
    });
    const data = await res.json();
    bossHP = data.bossHP;
    score = 0;
    combo = 0;
    playerHP = 3;
    updateHearts();
    setBossState("idle");
    updateBossHP();
    updateComboUI();
    await loadQuestion();
}

function quitGame() {
    window.location.href = "/";
}

/* =========================
   UTIL
========================= */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadProfile() {

    const res = await fetch(`/profile/${userId}`);
    const profile = await res.json();

    document.getElementById("xp").innerText =
        `XP: ${profile.xp} / 300`;

    document.getElementById("level").innerText =
        "Level: " + profile.level;

    document.getElementById("xpBar").style.width =
        (profile.xp / 300 * 100) + "%";
}
function updateHearts() {

    const container =
        document.getElementById("hearts");

    container.innerHTML = "";

    for (let i = 0; i < 3; i++) {

        const orb =
            document.createElement("div");

        orb.classList.add("life-orb");

        if (i < playerHP) {
            orb.classList.add("active");
        }

        container.appendChild(orb);
    }
}
/* =========================
   START
========================= */
function startTimer() {
    clearInterval(timerInterval); // ใช้แค่อันเดียวพอ
    if (timerInterval) clearInterval(timerInterval);
    timer = 7;

    const timerEl = document.getElementById("timer");
    timerEl.classList.remove("timer-danger");

    timerEl.innerText = "Time: " + timer;

    timerInterval = setInterval(async () => {
        timer--;

        if (timer <= 3) {
            timerEl.classList.add("timer-danger");
        } else {
            timerEl.classList.remove("timer-danger");
        }

        timerEl.innerText = "Time: " + timer;

        if (timer <= 0) {
            clearInterval(timerInterval);

            combo = 0;
            playerHP--;

            updateHearts();
            updateComboUI();

            setBossState("attack");
            showDamage("-1", "laugh");

            if (playerHP <= 0) {
                await delay(600);
                showEndCard("YOU LOSE!");
                return;
            }

            await delay(800);
            setBossState("idle");

            loadQuestion();
        }
    }, 1000);
}
async function startGame() {
    console.log("START GAME CALLED");
    await initGame();
    await loadProfile();
    playerHP = 3;
    updateHearts();
    await loadQuestion();
    updateComboUI();
}
startGame();