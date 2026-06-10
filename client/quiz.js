const questions = [
{
    question: "A recruiter asks ₹500 registration fee before interview.",
    answers: ["Legitimate", "Scam"],
    correct: "Scam"
},
{
    question: "Recruiter email is hr@gmail.com",
    answers: ["Legitimate", "Scam"],
    correct: "Scam"
},
{
    question: "Interview conducted through Telegram.",
    answers: ["Legitimate", "Scam"],
    correct: "Scam"
},
{
    question: "Company email ends with @infosys.com",
    answers: ["Legitimate", "Scam"],
    correct: "Legitimate"
},
{
    question: "Job offers ₹80,000/month without interview.",
    answers: ["Legitimate", "Scam"],
    correct: "Scam"
},
{
    question: "Recruiter asks for Aadhaar and PAN before interview.",
    answers: ["Legitimate", "Scam"],
    correct: "Scam"
},
{
    question: "Official company career page is used for application.",
    answers: ["Legitimate", "Scam"],
    correct: "Legitimate"
},
{
    question: "Recruiter asks payment for training materials.",
    answers: ["Legitimate", "Scam"],
    correct: "Scam"
},
{
    question: "You receive a job offer after multiple interview rounds.",
    answers: ["Legitimate", "Scam"],
    correct: "Legitimate"
},
{
    question: "Amazon recruiter contacts through Telegram only.",
    answers: ["Legitimate", "Scam"],
    correct: "Scam"
}
];

const questionElement =
document.getElementById("question");

const answersElement =
document.getElementById("answers");

const nextBtn =
document.getElementById("nextBtn");

const scoreElement =
document.getElementById("score");

const progressElement =
document.getElementById("progress");

let currentQuestion = 0;
let score = 0;

function showQuestion() {

    resetState();

    progressElement.innerText =
    `Question ${currentQuestion + 1} of ${questions.length}`;

    const current =
    questions[currentQuestion];

    questionElement.innerText =
    current.question;

    current.answers.forEach(answer => {

        const button =
        document.createElement("button");

        button.innerText = answer;

        button.classList.add("answer-btn");

        button.addEventListener(
            "click",
            () => selectAnswer(button, answer)
        );

        answersElement.appendChild(button);

    });

}

function resetState() {

    nextBtn.style.display = "none";

    answersElement.innerHTML = "";

}

function selectAnswer(button, answer) {

    const correctAnswer =
    questions[currentQuestion].correct;

    const buttons =
    document.querySelectorAll(".answer-btn");

    buttons.forEach(btn => {

        btn.disabled = true;

        if(btn.innerText === correctAnswer) {
            btn.classList.add("correct");
        }

    });

    if(answer === correctAnswer) {
        score++;
    } else {
        button.classList.add("wrong");
    }

    nextBtn.style.display = "inline-block";

}

nextBtn.addEventListener("click", () => {

    currentQuestion++;

    if(currentQuestion < questions.length) {
        showQuestion();
    } else {
        showResult();
    }

});

function showResult() {

    questionElement.innerHTML =
    "🎉 Quiz Completed!";

    progressElement.innerHTML = "";

    answersElement.innerHTML = "";

    nextBtn.style.display = "none";

    const percentage =
    Math.round((score / questions.length) * 100);

    let message = "";

    if(score >= 8) {

        message =
        "Excellent! You are highly aware of cyber scams.";

    } else if(score >= 5) {

        message =
        "Good job! Keep improving your scam detection skills.";

    } else {

        message =
        "You need more awareness. Review the ScamShield guides.";

    }

    scoreElement.innerHTML = `
        <h2>Your Score: ${score} / ${questions.length}</h2>
        <h3>${percentage}%</h3>
        <p>${message}</p>

        <button onclick="restartQuiz()">
            Restart Quiz
        </button>
    `;

}

function restartQuiz() {

    currentQuestion = 0;

    score = 0;

    scoreElement.innerHTML = "";

    showQuestion();

}

showQuestion();