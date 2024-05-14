/*
readBlog.js

Author: Max Neil
Date created: 13/04/2024
Description: 
    
This file manages the displaying of blog posts. It also controls the search bar to search for a blog.
*/

//Fetches all the blogs in the database
async function fetchBlogs(searchQuery = '') {
    try {
        //Includes a search bar.
        //Searches as an encoded uri components which means it escapes any searches with
        //special characters. Prevents url injection attacks.
        const response = await fetch(`/readBlogs?search=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blogs = await response.json(); 
        //display the blogs on the page
        displayBlogs(blogs);
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
    }
}

//Displays the blogs on the page
function displayBlogs(blogs) {
    const mainDiv = document.getElementById('blogs-container');
    mainDiv.innerHTML = ''; 

    //Creates a new element for each blog
    //displays the username, title and text of the blog
    blogs.forEach(blog => {
        const blogDiv = document.createElement('div');
        blogDiv.className = 'blog-entry'; 
        blogDiv.innerHTML = `
            <h3>${blog.title}</h3>
            <h4> Author: ${blog.username}</h4>
            <p>${blog.text}</p>
        `;
        document.getElementById('blogs-container').appendChild(blogDiv);
    });
}

// Event listener for the search button
document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value;
    fetchBlogs(searchInput);
});

// Fetch all blogs initially
fetchBlogs();
