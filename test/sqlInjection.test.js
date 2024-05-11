const assert = require('assert');
const request = require('supertest');
const server = require('../app');

describe('SQL Injection in Search Bar', function() {
    it('should handle SQL injection attempts without server errors', async function() {
        // Attempt to inject SQL code in the search query
        const maliciousInput = "'; DROP TABLE blogs;--";
        let response;
        try {
            response = await request(server)
                .get('/readBlogs')
                .query({ search: maliciousInput });
                
            // Check if the server returns a proper JSON response and not an error
            assert.strictEqual(response.status, 200, 'Server should handle SQL injection gracefully');
            
        } catch (error) {
            // Handle unexpected errors during the request
            assert.fail(`Request failed: ${error.message}`);
        }
    });
});
