let editingId = null;
window.onload = () => {
    loadQuestions();
};
async function addQuestion() {

    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer").value;
    const difficulty = document.getElementById("difficulty").value;
    const option1 = document.getElementById("option1").value;
    const option2 = document.getElementById("option2").value;
    const option3 = document.getElementById("option3").value;
    const option4 = document.getElementById("option4").value;

    // 👉 ถ้ามี editingId = UPDATE
    if (editingId) {

        const response = await fetch(`/questions/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question,
                answer,
                difficulty,
                option1,
                option2,
                option3,
                option4
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("Updated!");
            editingId = null;
            document.getElementById("question").value = "";
            document.getElementById("answer").value = "";
            document.getElementById("difficulty").value = "easy";
            document.getElementById("option1").value = "";
            document.getElementById("option2").value = "";
            document.getElementById("option3").value = "";
            document.getElementById("option4").value = "";
            loadQuestions();
        }

        return;
    }

    // 👉 ถ้าไม่มี = CREATE
    const response = await fetch("/questions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question,
            answer,
            difficulty,
            option1,
            option2,
            option3,
            option4
        })
    });

    const data = await response.json();

    if (data.success) {
        alert("Question Added");
        loadQuestions();
    } else {
        alert("Failed");
    }
}

async function loadQuestions() {

    const response = await fetch("/questions");
    const questions = await response.json();

    const table = document.getElementById("questionTable");
    table.innerHTML = "";

    questions.forEach(q => {

        table.innerHTML += `
            <tr>
                <td>${q.id}</td>
                <td>${q.question}</td>
                <td>${q.answer}</td>
                <td>${q.difficulty}</td>
                <td>${q.option1}</td>
                <td>${q.option2}</td>
                <td>${q.option3}</td>
                <td>${q.option4}</td>
                <td>
                    <button onclick="editQuestion(${q.id})">✏️</button>
                    <button onclick="deleteQuestion(${q.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}
async function editQuestion(id) {

    const response = await fetch("/questions");
    const questions = await response.json();

    const q = questions.find(item => item.id === id);

    document.getElementById("question").value = q.question;
    document.getElementById("answer").value = q.answer;
    document.getElementById("difficulty").value = q.difficulty;

    editingId = id;
}
async function deleteQuestion(id) {

    if (!confirm("Are you sure?")) return;

    const response = await fetch(`/questions/${id}`, {
        method: "DELETE"
    });

    const data = await response.json();

    if (data.success) {
        alert("Deleted!");
        loadQuestions();
    } else {
        alert("Failed");
    }
}