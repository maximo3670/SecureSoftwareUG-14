const assert = require('assert');
const request = require('supertest');
const server = require('../app');

describe('DDoS Protection Tests', function() {
    let csrfToken, cookie;

    before(async function() {
        // Fetch CSRF token and session cookie before running tests
        const tokenResponse = await request(server)
            .get('/csrf-token')
            .expect(200);  // Ensure the request succeeds

        csrfToken = tokenResponse.body.csrfToken;
        cookie = tokenResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');
    });

    it('should block requests after rate limit is exceeded', async function() {
        this.timeout(20000); // Extend timeout to allow all requests to be sent and processed

        // Send a number of requests slightly above the limit
        const limit = 310;  // Assuming the limit is set to 300 requests per 15 minutes
        let responses = [];
        
        for (let i = 0; i < limit; i++) {
            // Fire requests without waiting for the previous one to complete
            responses.push(request(server)
                .post('/login')
                .set('Cookie', cookie)
                .send({ Username: 'Max', Password: 'Password123!', _csrf: csrfToken }));
        }

        // Wait for all requests to resolve
        responses = await Promise.all(responses.map(p => p.catch(e => e)));

        // Count responses with status codes indicating rate limit exceeded
        const rateLimitExceededResponses = responses.filter(response => response.status === 429);

        // Assert that at least one request fails due to rate limiting
        assert(rateLimitExceededResponses.length > 0, 'Expected at least one request to be blocked due to rate limiting');
    });
});
