/*
registrationHandler.js

Author: jon
Date created: 21/03/2024
Description: 
    I'll write this when i can be arsed
*/

document.getElementById("login").addEventListener("submit", function(event){
    event.preventDefault(); 

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
