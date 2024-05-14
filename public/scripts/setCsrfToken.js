/*
setCsrfToken.js

Author: Jonathan Belt
Date created: 21/04/2024
Description: 
    
The purpose of this script is to set a csrf token on any page with a form. This token is then used to 
verify the integrity of the form.
*/


document.addEventListener("DOMContentLoaded", function() {
  //Creates a new token
  fetch('/csrf-token')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      return response.json();
    })
    //Creates a hidden element in the form
    //This includes the csrf token
    .then(data => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '_csrf'; 
        input.value = data.csrfToken;
        form.appendChild(input);
      });
    })
    .catch(error => console.error('Error fetching CSRF token:', error));
});
