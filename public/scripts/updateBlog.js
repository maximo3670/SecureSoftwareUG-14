document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('blog');
    const urlParams = new URLSearchParams(window.location.search);
    const blogid = urlParams.get('blogid');

    async function fetchBlog() {
        try {
            const response = await fetch(`/getBlog/${blogid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blog = await response.json();
            document.getElementById('title').value = blog.title;
            document.getElementById('text').value = blog.text;
        } catch (error) {
            console.error('Failed to fetch blog:', error);
        }
    }

    fetchBlog(); // Fetch the blog when the page loads

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const title = document.getElementById('title').value;
        const text = document.getElementById('text').value;

        if (!title || !text) {
            alert('Title and text are required.');
            return;
        }

        const updatedBlog = {
            blogid: blogid,
            title: title,
            text: text
        };

        fetch('/updateBlog', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedBlog)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // This parses the response body as JSON
        })
        .then(data => {
            console.log(data.message); 
            window.location.href = '/account';
        })
        .catch((error) => {
            console.error('Failed to update blog:', error);
            alert(error.message);
        });
    });
});


