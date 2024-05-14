/*
accountBlogs.js

Author: Max Neil
Date created: 21/04/2024
Description: 
    
This is the java script code for the account page. The purpose of the page is to allow the logged in user
to view all of their own blogs and then have the ability to delete or edit them.
*/

//Fetches all the blogs written by the logged in user.
async function fetchBlogs() {
    try {
        const response = await fetch(`/readUserBlogs`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blogs = await response.json(); 
        //Displays the fetched blogs
        displayBlogs(blogs);
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
    }
}

//Displays the blogs on the webpage dynamically.
function displayBlogs(blogs) {
    const mainDiv = document.getElementById('blogs-container');
    mainDiv.innerHTML = '';  // Clear previous content

    //Each blog displays the title, text and username of the author
    blogs.forEach(blog => {
        const blogDiv = document.createElement('div');
        blogDiv.className = 'blog-entry'; 
        blogDiv.innerHTML = `
            <h3>${blog.title}</h3>
            <h4>Author: ${blog.username}</h4>
            <p>${blog.text}</p>
        `;

        // Create Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() { deleteBlog(blog.blogid); };

        // Create Update button
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Update';
        updateButton.onclick = function() {
            // Redirect to the update page with parameters
            window.location.href = `/account/updateBlog?blogid=${blog.blogid}`;
        };
        

        // Append buttons to the blogDiv
        blogDiv.appendChild(deleteButton);
        blogDiv.appendChild(updateButton);

        // Append the blog entry div to the main container
        mainDiv.appendChild(blogDiv);
    });
}

//Delete blog function is to remove the blog from the database and webpage
async function deleteBlog(blogid) {
    try {
        //Fetches a csrf token.
        const tokenResponse = await fetch('/csrf-token');
        if (!tokenResponse.ok) {
            throw new Error('Failed to fetch CSRF token');
        }
        const tokenData = await tokenResponse.json();
        const _csrf = tokenData.csrfToken;

        //Calls the delete blog request
        const response = await fetch(`/deleteBlog`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blogid, _csrf })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result.message);  

        //Refreshes the page by recalling fetchblogs()
        fetchBlogs();  
    } catch (error) {
        console.error('Failed to delete blog:', error);
    }
}

// Fetch all blogs initially
fetchBlogs();
