async function fetchBlogs(searchQuery = '') {
    try {
        const response = await fetch(`/readBlogs?search=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blogs = await response.json(); // This line corresponds to the error you're seeing
        displayBlogs(blogs);
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
    }
}

function displayBlogs(blogs) {
    const mainDiv = document.getElementById('blogs-container');
    mainDiv.innerHTML = '';

    blogs.forEach(blog => {
        const blogDiv = document.createElement('div');
        blogDiv.className = 'blog-entry';
        blogDiv.innerHTML = `
            <h3>${blog.title}</h3>
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
