<<<<<<< HEAD
/*
loginHandler.js

Author: jon & mitchell
Date created: 21/03/2024
Description: 
    I'll write this when i can be arsed
*/

function lockoutCheck(){
    if (lockoutData.attempts >= maxAttempts){
        document.getElementById("feedbackMessage").textContent = "You have temporarily locked out. Come back later";
        document.getElementById("submit").style.display = "none"; // Fixing this, 'none' should be a string
    }
}

window.addEventListener('load',lockoutCheck);

var maxAttempts = 3;
var lockoutDuration = 5 * 60 * 1000; // Lockout duration is set to 5 minutes (in milliseconds)

// Retrieve the lockout data from localStorage if available
var lockoutData = JSON.parse(localStorage.getItem("loginLockout")) || { attempts: 0, timestamp: null };

// Check if the lockout has expired
function isLockoutExpired() {
    if (!lockoutData.timestamp) return true; // Lockout never occurred
    return (Date.now() - lockoutData.timestamp) > lockoutDuration;
}

document.getElementById("login").addEventListener("submit", function(event){
  event.preventDefault(); 

  // Getting the data from the form
  var formData = {
      Username: document.getElementsByName("Username")[0].value,
      Password: document.getElementsByName("Password")[0].value,
      OTP: document.getElementsByName("OTP")[0].value // Add OTP field to the formData
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
      // If login is successful, redirect to home page
      document.getElementById("feedbackMessage").textContent = "Login successful!";
      document.getElementById("feedbackMessage").style.color = "green"; // Change color to green for success
      window.location.href = '/'; 
    } else if (data.message === "OTP verification required. Please enter the OTP sent to your email.") {
      // If OTP verification is required, show a pop-up or modal for OTP entry
      var otpInput = prompt("Please enter the OTP sent to your email:");
      if (otpInput !== null) { // Check if the user entered OTP or cancelled
        // Add entered OTP to formData and retry login
        formData.OTP = otpInput;
        retryLogin(formData);
      }
    } else {
      // If login failed for other reasons, display the error message
      document.getElementById("feedbackMessage").textContent = data.message || "Login failed. Please try again.";
    }
  })
  .catch((error) => {
    // This catches any other errors such as network errors
    document.getElementById("feedbackMessage").textContent = "An error occurred. Please try again.";
    console.error('Error:', error);
  });
});

// Function to retry login with updated formData (including OTP)
function retryLogin(formData) {
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
    // If login is successful after OTP verification, redirect to home page
    document.getElementById("feedbackMessage").textContent = "Login successful!";
    document.getElementById("feedbackMessage").style.color = "green"; // Change color to green for success
    window.location.href = '/'; 
  } else {
    // If login still fails after OTP verification, display the error message
    document.getElementById("feedbackMessage").textContent = data.message || "Login failed. Please try again.";
  }
})
.catch((error) => {
  // This catches any other errors such as network errors
  document.getElementById("feedbackMessage").textContent = "An error occurred. Please try again.";
  console.error('Error:', error);
});
}
=======
// Initialization function to check lockout status and update UI
function initializePage() {
  // Retrieve the lockout data from localStorage if available
  var lockoutData = JSON.parse(localStorage.getItem("loginLockout")) || { attempts: 0, timestamp: null };

  // Check if the lockout has expired
  if (lockoutData.attempts >= maxAttempts && !isLockoutExpired()) {
      document.getElementById("feedbackMessage").textContent = "You have temporarily locked out. Come back later";
      document.getElementById("submit").style.display = "none"; // Fixing this, 'none' should be a string
  }
}

// Call the initialization function when the page loads or returns to the page
window.addEventListener('load', initializePage);

document.getElementById("login").addEventListener("submit", function(event) {
  event.preventDefault();

  // Getting the data from the form
  var formData = {
      Username: document.getElementsByName("Username")[0].value,
      Password: document.getElementsByName("Password")[0].value
  };

  if (lockoutData.attempts >= maxAttempts && !isLockoutExpired()) {
      document.getElementById("feedbackMessage").textContent = "You have temporarily locked out. Come back later";
      document.getElementById("submit").style.display = "none"; // Fixing this, 'none' should be a string
  } else {
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

                  // If success flag is false, there is a message which corresponds to the error
                  document.getElementById("feedbackMessage").textContent = data.message || "Login failed. Please try again.";
                  lockoutData.attempts++;
                  if (lockoutData.attempts >= maxAttempts) {
                      lockoutData.timestamp = Date.now(); // Set lockout timestamp if max attempts reached
                  }
                  // Update the lockout data in localStorage
                  localStorage.setItem("loginLockout", JSON.stringify(lockoutData));
              }
          })

      .catch((error) => {

          // This catches any other errors such as network errors
          document.getElementById("feedbackMessage").textContent = "An error occurred. Please try again.";
          console.error('Error:', error);
          lockoutData.attempts++;
          if (lockoutData.attempts >= maxAttempts) {
              lockoutData.timestamp = Date.now(); // Set lockout timestamp if max attempts reached
          }
          // Update the lockout data in localStorage
          localStorage.setItem("loginLockout", JSON.stringify(lockoutData));
      });
  }
});
>>>>>>> parent of d6b022f (Fixed the error with lockout)
