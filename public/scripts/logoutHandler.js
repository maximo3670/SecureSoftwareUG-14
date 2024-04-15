document.addEventListener("DOMContentLoaded", function() {
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            const loginLogoutButton = document.getElementById('loginLogoutButton');
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
