document.addEventListener("DOMContentLoaded", function() {
  fetch('/csrf-token')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      return response.json();
    })
    .then(data => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '_csrf'; 
        input.value = data.csrfToken;
        console.log(input);
        form.appendChild(input);
      });
    })
    .catch(error => console.error('Error fetching CSRF token:', error));
});
