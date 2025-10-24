// Wait for the page to be fully loaded
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById('login-form');

    // This script will only find 'login-form' on login.html
    // It will do nothing on index.html, which is fine.
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            // Prevent the form from reloading the page
            event.preventDefault();

            // Get the values from the form
            let username = document.getElementById('username').value;
            let password = document.getElementById('password').value;
            let errorMessage = document.getElementById('error-message');

            // --- HARDCODED ADMIN LOGIN ---
            // This is where you set the admin's username and password
            const adminUser = "admin";
            const adminPass = "pass123";

            if (username === adminUser && password === adminPass) {
                // SUCCESS
                errorMessage.textContent = ""; // Clear any old errors

                // Optional: Save login state so billing.html knows
                sessionStorage.setItem('isAdminLoggedIn', 'true');

                // Redirect to the main billing page
                // .replace() prevents user from clicking "back" to login
                window.location.replace('billing.html');

            } else {
                // FAILED
                errorMessage.textContent = "Invalid username or password.";
            }
        });
    }
});