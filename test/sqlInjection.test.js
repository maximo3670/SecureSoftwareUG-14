const assert = require('assert');
const request = require('supertest');
const server = require('../app');

describe('SQL Injection in Search Bar with CSRF Protection', function() {
    let csrfToken, cookie;

    // Fetch CSRF token and session cookie before running tests
    before(async function() {
        // Assuming there is an endpoint to fetch the CSRF token
        const tokenResponse = await request(server)
            .get('/csrf-token')
            .expect(200); // Ensure the request succeeds, adjust this line if CSRF token endpoint has a different path

        csrfToken = tokenResponse.body.csrfToken;
        cookie = tokenResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');
    });

    it('should handle SQL injection attempts without server errors', async function() {
        // Attempt to inject SQL code in the search query
        const maliciousInput = "'; DROP TABLE blogs;--";
        let response;
        try {
            response = await request(server)
                .get('/readBlogs')
                .set('Cookie', cookie)
                .set('CSRF-Token', csrfToken) // Make sure your server expects CSRF token in headers or adjust accordingly
                .query({ search: maliciousInput });

            // Check if the server returns a proper JSON response and not an error
            assert.strictEqual(response.status, 200, 'Server should handle SQL injection gracefully');
            
        } catch (error) {
            // Handle unexpected errors during the request
            assert.fail(`Request failed: ${error.message}`);
        }
    });
});
