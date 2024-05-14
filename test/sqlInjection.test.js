const assert = require('assert');
const request = require('supertest');
const server = require('../app');
/*
sqlInjection.test.js

Author: Max Neil
Created: 12/05/2024
Description:
This is a test script written to test the system security against SQL Injection

It tests:
1. SQL Injection within the search function

*/
describe('SQL Injection in the search function', function() {
    let csrfToken, cookie;

    // Fetch CSRF token and session cookie before running tests
    before(async function() {
        // Assuming there is an endpoint to fetch the CSRF token
        const tokenResponse = await request(server)
            .get('/csrf-token')
            .expect(200); 

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
                .set('CSRF-Token', csrfToken) 
                .query({ search: maliciousInput });

            // Check if the server returns a proper JSON response and not an error
            assert.strictEqual(response.status, 200, 'Server should handle SQL injection');
            
        } catch (error) {
            // Handle unexpected errors during the request
            assert.fail(`Request failed: ${error.message}`);
        }
    });
});
