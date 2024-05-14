/*
updateBlog.js

Author: Max Neil
Date created: 21/04/2024
Description: 
    
This code will allow the user to update their blog post. It will auto fill the form with the current text
in the blog post.
*/

//This is called when the page gets loaded
//Its purpose is to auto fill the input boxes with the form to be updated
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('blog');

    //The required blog id is passed through the url parameters
    const urlParams = new URLSearchParams(window.location.search);
    const blogid = urlParams.get('blogid');

    async function fetchBlog() {
        try {
            //Fetches the specified blog
            const response = await fetch(`/getBlog/${blogid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blog = await response.json();

            //Auto fills in the input boxes
            document.getElementById('title').value = blog.title;
            document.getElementById('text').value = blog.text;

        //Catches any errors
        } catch (error) {
            console.error('Failed to fetch blog:', error);
        }
    }

    fetchBlog(); // Fetch the blog when the page loads

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        //Gets the updated blog text
        const title = document.getElementById('title').value;
        const text = document.getElementById('text').value;

        //csrf token
        var csrfToken = document.getElementsByName("_csrf")[0].value;

        //Doesnt allow blank submissions
        if (!title || !text) {
            alert('Title and text are required.');
            return;
        }

        const updatedBlog = {
            blogid: blogid,
            title: title,
            text: text,
            _csrf: csrfToken
        };

        //Calls the update blog endpoint
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
            return response.json(); 
        })
        //returns the user back to the account page after updating
        .then(data => {
            console.log(data.message); 
            window.location.href = '/account';
        })
        //Catches any potential errors
        .catch((error) => {
            console.error('Failed to update blog:', error);
            alert(error.message);
        });
    });
});


