/*
registrationHandler.js

Author: Jonathan Belt
Date created: 21/03/2024
Description: 
    
This JavaScript code manages the login process for a website.
When someone tries to log in, it collects their username and password from the form they filled out.
Then, it sends this information to the server using a special technique called Fetch.
Once the server responds, the code checks if the login was successful. If it was, it tells the user they've successfully logged in and takes them to the main page.
If there's an issue, like a wrong password or a server error, it lets the user know what went wrong.
This code ensures that users get clear messages about their login attempts.
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
