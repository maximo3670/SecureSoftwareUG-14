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
