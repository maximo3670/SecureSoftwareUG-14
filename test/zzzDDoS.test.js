const assert = require('assert');
const request = require('supertest');
const server = require('../app');

/*
DDoD.test.js

Author: Max Neil
Created: 12/05/2024
Description:
This is a test script written to test the system security against DDoS attacks
It does this by overloading the server with requests to see how it handles it

It tests:
1. Overloading server with login requests 

*/
// describe('DDoS Protection Tests', function() {
//     let csrfToken, cookie;

//     before(async function() {
//         // Fetch CSRF token and session cookie before running tests
//         const tokenResponse = await request(server)
//             .get('/csrf-token')
//             .expect(200);  // Ensure the request succeeds

//         csrfToken = tokenResponse.body.csrfToken;
//         cookie = tokenResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');
//     });

//     it('should block requests after rate limit is exceeded', async function() {
//         // Extend timeout to allow all requests to be sent and processed
//         this.timeout(20000); 

//         // Send a number of requests slightly above the limit which is 300
//         const limit = 310;  
//         let responses = [];
        
//         for (let i = 0; i < limit; i++) {
//             // Fire requests without waiting for the previous one to complete
//             responses.push(request(server)
//                 .post('/login')
//                 .set('Cookie', cookie)
//                 .send({ Username: 'Max', Password: 'Password123!', _csrf: csrfToken }));
//         }

//         // Wait for all requests to resolve
//         responses = await Promise.all(responses.map(p => p.catch(e => e)));

//         // Count responses with status codes indicating rate limit exceeded
//         const rateLimitExceededResponses = responses.filter(response => response.status === 429);

//         // Assert that at least one request fails due to rate limiting
//         assert(rateLimitExceededResponses.length > 0, 'Expected at least one request to be blocked due to rate limiting');
//     });
// });
