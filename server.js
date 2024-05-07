const app = require('./app');
const port = 3000;

// Initialize the database and start the server
const { initializeDb } = require('./db');

initializeDb().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error("Database initialization failed:", err);
});
