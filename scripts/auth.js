// Import Firebase instances
import { auth, db } from "../firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Signup Function
window.signup = function () {
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            return setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                correctGuesses: 0,
                incorrectGuesses: 0
            });
        })
        .then(() => {
            alert("Signup successful! Redirecting to login...");
            window.location.href = "login.html";
        })
        .catch(error => {
            alert(error.message);
        });
};

// Login Function
window.login = function () {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            //save login time in local storage
            localStorage.setItem("loginTime", Date.now());
            //Storing the email in session storage 
            sessionStorage.setItem("email", email);

            // Redirect to rules.html
            window.location.href = "rules.html";
        })
        .catch(error => {
            alert(error.message);
        });
};

// Logout Function
window.logout = function () {
    signOut(auth).then(() => {
        localStorage.removeItem("loginTime"); // Clear session data
        window.location.href = "index.html"; // Redirect to homepage
    });
};
