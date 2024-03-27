/*
registrationHandler.js

Author: jon
Date created: 21/03/2024
Description:
    I'll write this when i can be arsed
*/

let failedAttempts = parseInt(localStorage.getItem('failedAttempts')) || 0;
const maxAttempts = 3;
const lockoutDuration = 3000; // Lockout duration in milliseconds (e.g., 3000ms = 3 seconds)
let lockoutStartTime = parseInt(localStorage.getItem('lockoutStartTime')) || 0;

function isUserLockedOut() {
    if (failedAttempts >= maxAttempts && Date.now() - lockoutStartTime < lockoutDuration) {
        return true;
    } else {
        // Reset the lockout status if the lockout duration has passed
        if (Date.now() - lockoutStartTime >= lockoutDuration) {
            failedAttempts = 0;
            localStorage.setItem('failedAttempts', failedAttempts);
            localStorage.removeItem('lockoutStartTime');
        }
        return false;
    }
}

document.getElementById("login").addEventListener("submit", function(event){
    event.preventDefault();

    if (isUserLockedOut()) {
        // If the user is locked out, prevent further login attempts
        document.getElementById("feedbackMessage").textContent = "You are temporarily locked out. Please try again later.";
        return;
    }

    // Getting the data from the form
    var formData = {
        Username: document.getElementsByName("Username")[0].value,
        Password: document.getElementsByName("Password")[0].value
    };

    // Perform the fetch request to the login endpoint
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {

        // Feedback to the user if the login was successful
        document.getElementById("feedbackMessage").textContent = "Login successful!";
        document.getElementById("feedbackMessage").style.color = "green"; // Change color to green for success

        window.location.href = '/';
      } else {

        // Increment the failed attempts count
        failedAttempts++;
        localStorage.setItem('failedAttempts', failedAttempts);

        if (failedAttempts >= maxAttempts) {
            // If maximum attempts reached, lock the user out temporarily
            lockoutStartTime = Date.now();
            localStorage.setItem('lockoutStartTime', lockoutStartTime);
        }

        // If success flag is false, there is a message which corresponds to the error
        document.getElementById("feedbackMessage").textContent = data.message || "Login failed. Please try again.";
      }
    })
    .catch((error) => {

      // This catches any other errors such as network errors
      document.getElementById("feedbackMessage").textContent = "An error occurred. Please try again.";
      console.error('Error:', error);
    });
});
