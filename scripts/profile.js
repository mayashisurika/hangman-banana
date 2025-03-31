import { auth, db } from "../firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const usernameDisplay = document.getElementById("username-display");
const emailDisplay = document.getElementById("email-display");
const correctGuessesDisplay = document.getElementById("correct-guesses");
const incorrectGuessesDisplay = document.getElementById("incorrect-guesses");
const editUsernameButton = document.getElementById("edit-username");
const logoutButton = document.getElementById("logout-button");

// Wait for Firebase Auth to Load
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
        const userRef = doc(db, "users", user.uid);
        try {
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                usernameDisplay.textContent = userData.username || "No username set";
                emailDisplay.textContent = user.email;

                // Use the same field names as in hangman.js
                correctGuessesDisplay.textContent = userData.correctWordGuesses || 0;
                incorrectGuessesDisplay.textContent = userData.incorrectWordGuesses || 0;
                console.log("Profile loaded - Correct:", userData.correctWordGuesses, "Incorrect:", userData.incorrectWordGuesses);
            } else {
                console.error("User data not found in Firestore.");
                // Set defaults if no document exists
                correctGuessesDisplay.textContent = "0";
                incorrectGuessesDisplay.textContent = "0";
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            correctGuessesDisplay.textContent = "Error";
            incorrectGuessesDisplay.textContent = "Error";
        }
    } else {
        console.warn("No user logged in. Redirecting to index.html...");
        window.location.href = "index.html"; // Redirect if not logged in
    }
});

// Edit Username Function
editUsernameButton.addEventListener("click", async () => {
    const newUsername = prompt("Enter new username:");
    if (newUsername) {
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(db, "users", user.uid);
            try {
                await updateDoc(userRef, { username: newUsername });
                usernameDisplay.textContent = newUsername;
                alert("Username updated successfully!");
            } catch (error) {
                console.error("Error updating username:", error);
                alert("Failed to update username.");
            }
        }
    }
});

// Logout Function
logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "index.html"; // Redirect to home page
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to log out.");
    }
});