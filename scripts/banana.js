document.addEventListener("DOMContentLoaded", async () => {
    const questionText = document.getElementById("question-text");
    const answerButtons = document.getElementById("answer-buttons");
    const resultMessage = document.getElementById("result-message");

    let correctAnswer = "";

    // Fetch question from Banana API
    async function fetchBananaQuestion() {
        try {
            const response = await fetch("https://marcconrad.com/uob/banana/api.php");

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const textResponse = await response.text();
            console.log("Raw API Response:", textResponse);

            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (jsonError) {
                throw new Error("Failed to parse JSON. Raw response: " + textResponse);
            }

            if (!data || !data.question || !data.solution) {
                throw new Error("Invalid data format from API: " + JSON.stringify(data));
            }

            questionText.innerHTML = `Solve: <br><img src="${data.question}" alt="Banana Puzzle" width="750">`;
            correctAnswer = data.solution;
            generateAnswerButtons();
        } catch (error) {
            questionText.innerHTML = "Failed to load question.";
            console.error("Error fetching Banana API:", error);
        }
    }

    // Generate answer buttons (0-9)
    function generateAnswerButtons() {
        answerButtons.innerHTML = "";
        for (let i = 0; i <= 9; i++) {
            let button = document.createElement("button");
            button.textContent = i;
            button.classList.add("answer-btn");

            button.addEventListener("click", function () {
                checkAnswer(i);
            });

            answerButtons.appendChild(button);
        }
    }

    async function checkAnswer(selectedAnswer) {
        if (selectedAnswer == correctAnswer) {
            const currentWord = sessionStorage.getItem("currentWord")?.toUpperCase();
            console.log("Current Word:", currentWord);

            const wordList = [
                { word: 'VOLCANO', hint: 'A mountain that erupts lava' },
                { word: 'WHISPER', hint: 'Speaking very softly' },
                { word: 'TREASURE', hint: 'Something valuable, often hidden' },
                { word: 'ECHO', hint: 'A sound that bounces back' },
                { word: 'PYRAMID', hint: 'An ancient triangular structure' },
                { word: 'RAINBOW', hint: 'Appears after rain with seven colors' },
                { word: 'CASTLE', hint: 'A large, old building where kings lived' },
                { word: 'SHADOW', hint: 'A dark shape created by blocking light' },
                { word: 'COMPASS', hint: 'A tool that shows direction' },
                { word: 'MAZE', hint: 'A complex path that’s hard to navigate' },
                { word: 'OXYGEN', hint: 'The gas we breathe to survive' },
                { word: 'PARROT', hint: 'A colorful bird that can mimic speech' },
            ];

            const wordEntry = wordList.find(item => item.word === currentWord);
            console.log("Word Entry:", wordEntry);

            if (wordEntry && wordEntry.hint) {
                sessionStorage.setItem("hint", wordEntry.hint);
                window.opener?.postMessage({ type: "wonHint", hint: wordEntry.hint }, "*");
                console.log("Hint saved and message sent:", wordEntry.hint);
                resultMessage.innerHTML = "✅ Correct! Redirecting to Hangman with hint...";
            } else {
                console.error("Hint not found for the word:", currentWord);
                resultMessage.innerHTML = "❌ Error fetching hint!";
            }
        } else {
            resultMessage.innerHTML = "❌ Wrong answer. No hint for you!";
        }

        setTimeout(() => {
            window.location.href = "hangman.html";
        }, 2000);
    }

    fetchBananaQuestion();
});