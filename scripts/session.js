// Function to check if session is expired
function checkSession() {
    const loginTime = localStorage.getItem("loginTime");
    const sessionDuration = 20 * 60 * 1000; // 20 minutes in milliseconds

    if (loginTime) {
        const currentTime = Date.now();
        if (currentTime - loginTime > sessionDuration) {
            alert("Session expired! Please log in again.");
            logout(); // Log out user
        }
    } else {
        console.log("No login session found.");
    }
}

// Function to log out user (No Firebase imports needed)
function logout() {
    localStorage.removeItem("loginTime"); // Clear session data
    console.log("User logged out.");
    window.location.href = "login.html"; // Redirect to login page
}

// Run session check on page load
checkSession();
