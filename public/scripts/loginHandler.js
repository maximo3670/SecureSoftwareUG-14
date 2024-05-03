/*loginHandler.js

Author: jon & mitchell
Date created: 21/03/2024
Description: 
    I'll write this when i can be arsed
*/
<<<<<<< Updated upstream

const { sendOTP, storedOTP } = require('emailSend.js');
=======
const nm = require("nodemailer")
>>>>>>> Stashed changes

var maxAttempts = 3; // Maximum number of login attempts allowed
var lockoutDuration = 5 * 60 * 1000; // Lockout duration is set to 5 minutes (in milliseconds)
 
// Initialization function to check lockout status and update UI
function initializePage() {
  // Retrieve the lockout data from localStorage if available
  var lockoutData = JSON.parse(localStorage.getItem("loginLockout")) || { attempts: 0, timestamp: null };
  var twoFA = JSON.parse(localStorage.getItem("twoFA")) || {verified: false, twoFaTs: null};
 
  // Check if the lockout has expired
  if (lockoutData.attempts >= maxAttempts && !isLockoutExpired(lockoutData)) {
      document.getElementById("feedbackMessage").textContent = "You have temporarily locked out. Come back later";
      document.getElementById("submit").style.display = "none"; // Fixing this, 'none' should be a string
  }
  if(isLockoutExpired(lockoutData)){
    lockoutData.attempts = 0;
    localStorage.setItem("loginLockout", JSON.stringify(lockoutData));
  }

  if(is2FAExpired(twoFA)){
    twoFA.verified == false;
    localStorage.setItem("twoFA", JSON.stringify(twoFA));

  }
}

function isLockoutExpired(lockoutData) {
    if (!lockoutData.timestamp) return true; // Lockout never occurred
    return (Date.now() - lockoutData.timestamp) > lockoutDuration;
}

function is2FAExpired(twoFA){
    if(!twoFA.timestamp) return true;
    return (Date.now() - twoFA.timestamp) > 14 * 24 * 60 * 60 * 1000;
}
 
// Call the initialization function when the page loads or returns to the page
window.addEventListener('load', initializePage);
 
document.getElementById("login").addEventListener("submit", function(event) {
    event.preventDefault();
   
    // Getting the data from the form
    var formData = {
        Username: document.getElementsByName("Username")[0].value,
        Password: document.getElementsByName("Password")[0].value,
    };
   
    var lockoutData = JSON.parse(localStorage.getItem("loginLockout")) || { attempts: 0, timestamp: null };
    var twoFA = JSON.parse(localStorage.getItem("twoFA")) || {verified: false, twoFaTs: null};
  
    const maxAttempts = 3; // Define the maximum number of login attempts here
  
    if (lockoutData.attempts >= maxAttempts && !isLockoutExpired(lockoutData)) {
        document.getElementById("feedbackMessage").textContent = "You have temporarily locked out. Come back later";
        document.getElementById("submit").style.display = "none"; // Fixing this, 'none' should be a string
    }if (!twoFA.verified || is2FAExpired(twoFA)) {
        document.getElementById("feedbackMessage").textContent = "You have not been verified via two-factor authentication. We have sent out an email tied to your account";
        sendOTP(Username, Password);
    } else if (!document.getElementsByName("OTP")[0].value) {
        document.getElementById("feedbackMessage").textContent = "Please enter the OTP sent to your email.";
    } else {
        const OTP = document.getElementsByName("OTP")[0].value;
        if (storedOTP() === OTP) {
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
                    // Feedback message for successful login
                    document.getElementById("feedbackMessage").textContent = "Login successful!";
                } else {
                    // Update lockout data and UI for failed login attempt
                    lockoutData.attempts++;
                    lockoutData.timestamp = Date.now();
                    localStorage.setItem("loginLockout", JSON.stringify(lockoutData));
                    document.getElementById("feedbackMessage").textContent = "Login failed. Please try again.";
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            lockoutData.attempts++;
            lockoutData.timestamp = Date.now();
            localStorage.setItem("loginLockout", JSON.stringify(lockoutData));
            document.getElementById("feedbackMessage").textContent = "Incorrect OTP. Please try again.";
        }
    }
  });