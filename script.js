
const passages = [
    "Small steps every day can lead to big changes. Keep learning, stay curious, and trust the process.",
    "Good habits are built through patience and practice. Focus on progress instead of trying to be perfect.",
    "Technology gives us new ways to solve problems, share ideas, and make everyday tasks easier.",
    "A calm mind and a clear goal can turn a difficult challenge into a useful learning experience.",
    "Creativity begins when we ask questions, explore different ideas, and try something new."
];

const passageEl = document.getElementById("passage");
const inputEl = document.getElementById("typingInput");

let duration = 30;
let timeLeft = 30;
let started = false;
let finished = false;
let timer = null;
let startTime = 0;
let targetText = "";

const timeEl = document.getElementById("time");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const bestEl = document.getElementById("best");
const progressEl = document.getElementById("progress");
const messageEl = document.getElementById("message");
const resultEl = document.getElementById("result");

function getBest() {
    return Number(localStorage.getItem("typesprintBest")) || 0;
}

function updateBest() {
    bestEl.textContent = getBest();
}

function choosePassage() {
    return passages[Math.floor(Math.random() * passages.length)];
}

function renderPassage(typed = "") {
    passageEl.innerHTML = "";

    for (let i = 0; i < targetText.length; i++) {
        const span = document.createElement("span");
        span.textContent = targetText[i];

        if (i < typed.length) {
            span.className =
                typed[i] === targetText[i] ? "correct" : "incorrect";
        } else if (i === typed.length && !finished) {
            span.className = "current";
        }

        passageEl.appendChild(span);
    }
}

function calculateStats() {
    const typed = inputEl.value;
    let correct = 0;

    for (let i = 0; i < Math.min(typed.length, targetText.length); i++) {
        if (typed[i] === targetText[i]) correct++;
    }

    const elapsed = started
        ? Math.max(0.1, (Date.now() - startTime) / 1000)
        : 0;

    const wpm = elapsed > 0
        ? Math.round((correct / 5) / (elapsed / 60))
        : 0;

    const accuracy = typed.length > 0
        ? Math.round((correct / typed.length) * 100)
        : 100;

    return { correct, wpm, accuracy };
}

function updateStats() {
    const stats = calculateStats();

    wpmEl.textContent = stats.wpm;
    accuracyEl.textContent = stats.accuracy;
    progressEl.style.width =
        ((duration - timeLeft) / duration * 100) + "%";

    return stats;
}

function startTimer() {
    if (started || finished) return;

    started = true;
    startTime = Date.now();
    messageEl.textContent = "Keep going! You're doing great.";

    timer = setInterval(() => {
        timeLeft = Math.max(
            0,
            duration - Math.floor((Date.now() - startTime) / 1000)
        );

        timeEl.textContent = timeLeft + "s";
        updateStats();

        if (timeLeft <= 0) finishTest();
    }, 100);
}

function finishTest() {
    if (finished) return;

    finished = true;
    clearInterval(timer);
    timer = null;
    timeLeft = 0;

    inputEl.disabled = true;
    timeEl.textContent = "0s";

    const stats = updateStats();
    const previousBest = getBest();
    let newBest = false;

    if (stats.wpm > previousBest) {
        localStorage.setItem("typesprintBest", stats.wpm);
        newBest = true;
    }

    updateBest();

    document.getElementById("finalWpm").textContent = stats.wpm;
    document.getElementById("finalAccuracy").textContent =
        stats.accuracy + "%";

    document.querySelector("#result h2").textContent =
        newBest ? "New personal best! 🎉" : "Test completed! 🎉";

    resultEl.hidden = false;
    messageEl.textContent = "Test finished. Check your results!";
    renderPassage(inputEl.value);
}

function resetTest() {
    clearInterval(timer);
    timer = null;

    started = false;
    finished = false;
    timeLeft = duration;
    startTime = 0;
    targetText = choosePassage();

    inputEl.value = "";
    inputEl.disabled = false;

    timeEl.textContent = duration + "s";
    wpmEl.textContent = "0";
    accuracyEl.textContent = "100";
    progressEl.style.width = "0%";
    messageEl.textContent = "Start typing to begin the timer.";

    resultEl.hidden = true;

    renderPassage();
    updateBest();
}

inputEl.addEventListener("input", () => {
    if (finished) return;

    if (!started && inputEl.value.length > 0) {
        startTimer();
    }

    if (inputEl.value.length > targetText.length) {
        inputEl.value = inputEl.value.slice(0, targetText.length);
    }

    renderPassage(inputEl.value);
    updateStats();

    if (inputEl.value.length >= targetText.length) {
        finishTest();
    }
});

document.querySelectorAll(".duration").forEach(button => {
    button.addEventListener("click", () => {
        duration = Number(button.dataset.time);

        document.querySelectorAll(".duration").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        resetTest();
    });
});

document.getElementById("restart").addEventListener("click", resetTest);

document.getElementById("tryAgain").addEventListener("click", () => {
    resetTest();
    inputEl.focus();
});

resetTest();