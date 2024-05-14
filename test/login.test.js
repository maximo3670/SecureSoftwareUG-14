const assert = require('assert');
const request = require('supertest');
const server = require('../app');

/*
login.test.js

Author: Max Neil
Created: 12/05/2024
Description:
This is a test script written to test the login system of the website

It tests:
1. Correct login details
2. Incorrect login details
3. Account enumeration timing

*/

describe('Login Tests', function() {
    let csrfToken, cookie;

    // Fetch CSRF token and session cookie before running tests
    before(async function() {
        // Perform a get request to fetch the CSRF token
        const tokenResponse = await request(server)
            .get('/csrf-token')
            .expect(200);  // Ensure the request succeeds

        csrfToken = tokenResponse.body.csrfToken;
        cookie = tokenResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');
    });

    describe('Correct login details', function() {
        it('should login if the details are correct', async function() {
            let response;
            try {
                response = await request(server)
                    .post('/login')
                    .set('Cookie', cookie)
                    .send({ Username: 'Max', Password: 'Password123!', _csrf: csrfToken });
                
                assert.strictEqual(response.status, 200, 'Failed to log in with correct credentials');
                assert.strictEqual(response.body.message, 'Login successful!', 'Unexpected response message');
            } catch (error) {
                // Handle unexpected errors during the request
                assert.fail(`Login request failed: ${error.message}`);
            }
        });
    });

    describe('Incorrect login details', function() {
        it('should not login if the details are incorrect', async function() {
            let response;
            try {
                response = await request(server)
                    .post('/login')
                    .set('Cookie', cookie)
                    .set('CSRF-Token', csrfToken)
                    .send({ Username: 'NonexistingUser', Password: 'Password123!', _csrf: csrfToken  });

                assert.strictEqual(response.status, 401, 'Incorrectly allowed login with wrong credentials');
                assert.strictEqual(response.body.message, 'Username or password is incorrect.', 'Unexpected or missing error message');
            } catch (error) {
                // Handle unexpected errors during the request
                assert.fail(`Login request failed unexpectedly: ${error.message}`);
            }
        });
    });

    describe('Account Enumeration', function() {
        this.timeout(5000);

        it('should have consistent response times for existing and non-existing users', async function() {
            // Measure response time for a non-existing user
            const startNonExisting = Date.now();
            let responseNonExisting;
            try {
                responseNonExisting = await request(server)
                    .post('/login')
                    .set('Cookie', cookie)
                    .set('CSRF-Token', csrfToken)
                    .send({ Username: 'nonexistinguser', Password: 'password123', _csrf: csrfToken  });
            } catch (error) {
                responseNonExisting = error.response;
            }
            const durationNonExisting = Date.now() - startNonExisting;

            // Measure response time for an existing user
            const startExisting = Date.now();
            let responseExisting;
            try {
                responseExisting = await request(server)
                    .post('/login')
                    .set('Cookie', cookie)
                    .set('CSRF-Token', csrfToken)
                    .send({ Username: 'Max', Password: 'wrongpassword', _csrf: csrfToken });
            } catch (error) {
                responseExisting = error.response;
            }
            const durationExisting = Date.now() - startExisting;

            // Asserting that both responses have similar timing
            assert(Math.abs(durationExisting - durationNonExisting) < 100, 'Response times differ significantly');
        });
    });
});
