/*
registrationHandler.js

Author: Max Neil
Date created: 21/03/2024
Description: 
    Write when i can be bothered

*/

document.getElementById("blog").addEventListener("submit", function(event){
    event.preventDefault(); 
  
    //Getting the data from the form
    var formData = {
        title: document.getElementsByName("title")[0].value,
        text: document.getElementsByName("text")[0].value,
    };
  
    // Perform the fetch request
    fetch('/writeblog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) { 

        //Feedback to the user if the blog upload was successful
        document.getElementById("feedbackMessage").textContent = "Blog submitted successfully!";
        document.getElementById("feedbackMessage").style.color = "green"; // Change color to green for success
        document.getElementById("blog").reset(); // Reset form 
      } else {

        // If success flag is false there is a message which corrosponds to the error
        document.getElementById("feedbackMessage").textContent = data.message || "blog upload failed. Please try again.";
      }
    })
    .catch((error) => {

      // This catches any other errors such as network errors
      document.getElementById("feedbackMessage").textContent = "An error occurred. Please try again.";
      console.error('Error:', error);
    });
});