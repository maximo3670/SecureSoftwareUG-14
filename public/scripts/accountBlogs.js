async function fetchBlogs() {
    try {
        const response = await fetch(`/readUserBlogs`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blogs = await response.json(); 
        displayBlogs(blogs);
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
    }
}

function displayBlogs(blogs) {
    const mainDiv = document.getElementById('blogs-container');
    mainDiv.innerHTML = '';  // Clear previous content

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
        // Update button does nothing for now, prepare for future implementation
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

async function deleteBlog(blogid) {
    try {
        const tokenResponse = await fetch('/csrf-token');
        if (!tokenResponse.ok) {
            throw new Error('Failed to fetch CSRF token');
        }
        const tokenData = await tokenResponse.json();
        const _csrf = tokenData.csrfToken;

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
        fetchBlogs();  
    } catch (error) {
        console.error('Failed to delete blog:', error);
    }
}

// Fetch all blogs initially
fetchBlogs();
