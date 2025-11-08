const questions = [
  {
    question: "Which activity do you enjoy the most?",
    answers: [
      { text: "Solving logical problems", career: "Software Engineer" },
      { text: "Designing visuals or interfaces", career: "UI/UX Designer" },
      { text: "Helping people or teaching", career: "Educator" },
      { text: "Planning and organizing events", career: "Project Manager" }
    ]
  },
  {
    question: "What type of work environment do you prefer?",
    answers: [
      { text: "Tech-driven and innovative", career: "Software Engineer" },
      { text: "Creative and flexible", career: "UI/UX Designer" },
      { text: "Collaborative and supportive", career: "Educator" },
      { text: "Fast-paced and structured", career: "Project Manager" }
    ]
  },
  {
    question: "Which skill best describes you?",
    answers: [
      { text: "Analytical thinking", career: "Software Engineer" },
      { text: "Creativity", career: "UI/UX Designer" },
      { text: "Empathy", career: "Educator" },
      { text: "Leadership", career: "Project Manager" }
    ]
  }
];

const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const resultBox = document.getElementById("result-box");
const careerResult = document.getElementById("career-result");
const restartButton = document.getElementById("restart-btn");

let currentQuestionIndex = 0;
let careerCount = {};

function startQuiz() {
  currentQuestionIndex = 0;
  careerCount = {};
  resultBox.classList.add("hidden");
  questionContainer.classList.remove("hidden");
  nextButton.classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.classList.add("btn");
    button.addEventListener("click", () => selectAnswer(answer.career));
    answerButtons.appendChild(button);
  });
}

function resetState() {
  nextButton.classList.add("hidden");
  answerButtons.innerHTML = "";
}

function selectAnswer(career) {
  careerCount[career] = (careerCount[career] || 0) + 1;
  nextButton.classList.remove("hidden");
}

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  questionContainer.classList.add("hidden");
  nextButton.classList.add("hidden");
  resultBox.classList.remove("hidden");

  let topCareer = Object.keys(careerCount).reduce((a, b) =>
    careerCount[a] > careerCount[b] ? a : b
  );

  careerResult.textContent = `You might be a great fit for: ${topCareer}`;
}

restartButton.addEventListener("click", startQuiz);

startQuiz();
