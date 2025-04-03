// Import necessary Firebase functions
import { db, auth } from "../firebase-config.js";
import { doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Game Variables
let selectedWord = "";
let guessedLetters = [];
let correctWordGuesses = 0;
let incorrectWordGuesses = 0;
let wrongGuesses = 0;
let hintUsed = false;
const maxGuesses = 6;

// Word List Array
const wordList = [
    { word: 'Volcano', hint: 'A mountain that erupts lava' },
    { word: 'Whisper', hint: 'Speaking very softly' },
    { word: 'Treasure', hint: 'Something valuable, often hidden' },
    { word: 'Echo', hint: 'A sound that bounces back' },
    { word: 'Pyramid', hint: 'An ancient triangular structure' },
    { word: 'Rainbow', hint: 'Appears after rain with seven colors' },
    { word: 'Castle', hint: 'A large, old building where kings lived' },
    { word: 'Shadow', hint: 'A dark shape created by blocking light' },
    { word: 'Compass', hint: 'A tool that shows direction' },
    { word: 'Maze', hint: 'A complex path that’s hard to navigate' },
    { word: 'Oxygen', hint: 'The gas we breathe to survive' },
    { word: 'Parrot', hint: 'A colorful bird that can mimic speech' },
];

// Get HTML Elements
const wordDisplay = document.getElementById("word-display");
const keyboardContainer = document.getElementById("keyboard");
const hintDisplay = document.getElementById("hint-display");
const hintButton = document.getElementById("hint-button");
const hangmanCanvas = document.getElementById("hangmanCanvas");

// Function to Load Existing Counts from Firebase
async function loadUserStats() {
    // Wait for auth state to be determined
    await new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        });
    });

    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                correctWordGuesses = data.correctWordGuesses || 0;
                incorrectWordGuesses = data.incorrectWordGuesses || 0;
                console.log(`Loaded counts - Correct: ${correctWordGuesses}, Incorrect: ${incorrectWordGuesses}`);
            } else {
                // Initialize new user with 0 counts
                await setDoc(userRef, {
                    correctWordGuesses: 0,
                    incorrectWordGuesses: 0
                }, { merge: true });
                correctWordGuesses = 0;
                incorrectWordGuesses = 0;
                console.log("Initialized new user with counts at 0");
            }
        } catch (error) {
            console.error("Error loading user stats:", error);
            // Fallback to 0 if there's an error, but log it
            correctWordGuesses = 0;
            incorrectWordGuesses = 0;
        }
    } else {
        console.log("No user authenticated - counts set to 0");
        correctWordGuesses = 0;
        incorrectWordGuesses = 0;
    }
}

// Function to Select a Random Word
function getRandomWord() {
    const currentWord = sessionStorage.getItem("currentWord");

    if (currentWord) {
        selectedWord = currentWord;
        guessedLetters = JSON.parse(sessionStorage.getItem("guessedLetters")) || [];
        wrongGuesses = parseInt(sessionStorage.getItem("wrongGuesses")) || 0;
        hintUsed = sessionStorage.getItem("hintUsed") === "true";
    } else {
        let usedWords = JSON.parse(sessionStorage.getItem("usedWords")) || [];
        let availableWords = wordList.filter(item => !usedWords.includes(item.word));

        if (availableWords.length === 0) {
            sessionStorage.removeItem("usedWords");
            availableWords = [...wordList];
        }

        const randomItem = availableWords[Math.floor(Math.random() * availableWords.length)];
        selectedWord = randomItem.word.toUpperCase();
        
        sessionStorage.setItem("currentWord", selectedWord);
        sessionStorage.setItem("guessedLetters", JSON.stringify([]));
        sessionStorage.setItem("wrongGuesses", "0");
        sessionStorage.setItem("usedWords", JSON.stringify([...usedWords, selectedWord]));
        sessionStorage.setItem("hintUsed", "false");
        guessedLetters = [];
        hintUsed = false;
    }

    updateWordDisplay();
    initializeKeyboard();
    updateHangmanImage();
    updateHintButtonState();
}

// Function to Update the Word Display
function updateWordDisplay() {
    if (!wordDisplay) return;
    wordDisplay.innerHTML = selectedWord
        .split("")
        .map(letter => (guessedLetters.includes(letter) ? letter : "_"))
        .join(" ");
}

// Function to Create the Keyboard Buttons Dynamically - AI generated
function initializeKeyboard() {
    if (!keyboardContainer) return;
    keyboardContainer.innerHTML = "";

    for (let i = 65; i <= 90; i++) {
        const button = document.createElement("button");
        const letter = String.fromCharCode(i);
        button.innerText = letter;
        button.classList.add("letter-button");
        button.disabled = guessedLetters.includes(letter);
        button.addEventListener("click", () => {
            handleLetterClick(letter);
            button.disabled = true;
        });
        keyboardContainer.appendChild(button);
    }
}

// Function to Handle Letter Selection
function handleLetterClick(letter) {
    if (guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);
    sessionStorage.setItem("guessedLetters", JSON.stringify(guessedLetters));

    if (!selectedWord.includes(letter)) {
        wrongGuesses++;
        sessionStorage.setItem("wrongGuesses", wrongGuesses.toString());
    }

    updateWordDisplay();
    updateHangmanImage();
    checkGameStatus();
}

// Function to Check if Word is Fully Guessed
function isWordGuessed() {
    return selectedWord.split("").every(letter => guessedLetters.includes(letter));
}

// Function to Store Word Guess Counts in Firebase - AI generated
// This function updates the user's correct and incorrect word guess counts in Firestore
async function storeGuessCounts() {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
            await updateDoc(userRef, {
                correctWordGuesses: correctWordGuesses,
                incorrectWordGuesses: incorrectWordGuesses
            });
            console.log(`Stored counts - Correct: ${correctWordGuesses}, Incorrect: ${incorrectWordGuesses}`);
        } catch (error) {
            console.error("Error updating guess counts: ", error);
        }
    } else {
        console.log("No user authenticated - counts not stored");
    }
}

// Function to Check Game Status (Win or Lose)
async function checkGameStatus() {
    if (isWordGuessed()) {
        correctWordGuesses++;
        console.log(`Word correct - New correct count: ${correctWordGuesses}`);
        alert("🎉 Congratulations! You guessed the word!");
        await storeGuessCounts();
        resetGame();
    } else if (wrongGuesses >= maxGuesses) {
        incorrectWordGuesses++;
        console.log(`Word incorrect - New incorrect count: ${incorrectWordGuesses}`);
        alert(`💀 Game Over! The word was "${selectedWord}"`);
        await storeGuessCounts();
        resetGame();
    }
}

// Function to Reset the Game
function resetGame() {
    sessionStorage.removeItem("currentWord");
    sessionStorage.removeItem("guessedLetters");
    sessionStorage.removeItem("wrongGuesses");
    sessionStorage.removeItem("hint");
    sessionStorage.setItem("hintUsed", "false");
    wrongGuesses = 0;
    guessedLetters = [];
    hintUsed = false;
    hintDisplay.textContent = "";
    getRandomWord();
}

// Function to Update Hangman drawing based on wrong guesses
function updateHangmanImage() {
    const ctx = hangmanCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, hangmanCanvas.width, hangmanCanvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(10, 190);
    ctx.lineTo(150, 190);
    ctx.moveTo(30, 190);
    ctx.lineTo(30, 20);
    ctx.lineTo(100, 20);
    ctx.lineTo(100, 40);
    ctx.stroke();

    if (wrongGuesses > 0) {
        ctx.beginPath();
        ctx.arc(100, 60, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (wrongGuesses > 1) {
        ctx.beginPath();
        ctx.moveTo(100, 80);
        ctx.lineTo(100, 130);
        ctx.stroke();
    }
    if (wrongGuesses > 2) {
        ctx.beginPath();
        ctx.moveTo(100, 90);
        ctx.lineTo(80, 110);
        ctx.stroke();
    }
    if (wrongGuesses > 3) {
        ctx.beginPath();
        ctx.moveTo(100, 90);
        ctx.lineTo(120, 110);
        ctx.stroke();
    }
    if (wrongGuesses > 4) {
        ctx.beginPath();
        ctx.moveTo(100, 130);
        ctx.lineTo(80, 160);
        ctx.stroke();
    }
    if (wrongGuesses > 5) {
        ctx.beginPath();
        ctx.moveTo(100, 130);
        ctx.lineTo(120, 160);
        ctx.stroke();
    }
}

// Function to update hint button state
function updateHintButtonState() {
    if (hintButton) {
        hintButton.disabled = hintUsed;
    }
}

// Function to handle hint button click
function handleHintRequest() {
    if (hintUsed) return;

    if (confirm("Would you like to play a mini-game to earn a hint?")) {
        hintUsed = true;
        sessionStorage.setItem("hintUsed", "true");
        updateHintButtonState();
        window.location.href = "banana.html";
    }
}

// Function to display hint if won
function displayHint(hint) {
    if (hintDisplay && hint) {
        hintDisplay.textContent = `Hint: ${hint}`;
    }
}

// Initialize Game When Page Loads
document.addEventListener("DOMContentLoaded", async () => {
    await loadUserStats(); // Load existing stats first
    getRandomWord();
    
    if (hintButton) {
        hintButton.addEventListener("click", handleHintRequest);
    }

    const wonHint = sessionStorage.getItem("hint");
    if (wonHint) {
        displayHint(wonHint);
    }

    window.addEventListener("message", (event) => {
        if (event.data.type === "wonHint" && event.data.hint) {
            displayHint(event.data.hint);
            sessionStorage.setItem("hint", event.data.hint);
        }
    });

    // Log current user for debugging
    console.log("Current user:", auth.currentUser);
});