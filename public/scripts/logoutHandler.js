/*
logoutHandler.js

Author: Max Neil
Date created: 21/04/2024
Description: 
    
This is to create a dynamic login and logout button on the webpage.
*/
document.addEventListener("DOMContentLoaded", function() {
    //Checks if a user is logged in
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            const loginLogoutButton = document.getElementById('loginLogoutButton');
            //Switches the button around accordingly
            if (data.loggedIn) {
                loginLogoutButton.textContent = 'Logout';
                loginLogoutButton.href = '/logout';
            } else {
                loginLogoutButton.textContent = 'Login';
                loginLogoutButton.href = '/login';
            }
        })
        .catch(error => console.error('Error checking session:', error));
});
