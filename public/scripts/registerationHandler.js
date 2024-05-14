/*
registrationHandler.js

Author: Max Neil
Date created: 21/03/2024
Description: 
    This script handles everything to do with registration. It takes the input from the
    forms and creates a request to the server to store the information in the database.
    It provides the user with a feedback message letting them know whether it was successful or not.

*/

document.getElementById("login").addEventListener("submit", function(event){
    event.preventDefault(); 
  
    //Getting the data from the form
    var Username = document.getElementsByName("Username")[0].value;
    var Password = document.getElementsByName("Password")[0].value;
    var ConfirmPassword = document.getElementsByName("ConfirmPassword")[0].value;
    var Firstname = document.getElementsByName("Firstname")[0].value;
    var Lastname = document.getElementsByName("Lastname")[0].value;
    var Email = document.getElementsByName("Email")[0].value;
    var csrfToken = document.getElementsByName("_csrf")[0].value;
    var formData = {
        Username: Username,
        Password: Password,
        ConfirmPassword: ConfirmPassword,
        Firstname: Firstname,
        Lastname: Lastname,
        Email: Email,
        _csrf: csrfToken 
    };
  
    // Perform the fetch request
    fetch('/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) { 

        //Feedback to the user if the registration was successful
        document.getElementById("feedbackMessage").textContent = "Registration successful!";
        document.getElementById("feedbackMessage").style.color = "green"; // Change color to green for success
        document.getElementById("login").reset(); // Reset form 
      } else {

        // If success flag is false there is a message which corrosponds to the error
        document.getElementById("feedbackMessage").textContent = data.message || "Registration failed. Please try again.";
      }
    })
    .catch((error) => {

      // This catches any other errors such as network errors
      document.getElementById("feedbackMessage").textContent = "An error occurred. Please try again.";
      console.error('Error:', error);
    });
});