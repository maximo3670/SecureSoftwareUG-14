const assert = require('assert');
const request = require('supertest');
const server = require('../app');

/*
csrfProtection.test.js

Author: Jonathan Belt
Created: 14/05/2024
Description:
This is a test script written to verify CSRF protection across the web application.

It tests:
1. Requests with valid CSRF tokens.
2. Requests with invalid CSRF tokens.
3. Requests without CSRF tokens.
*/

describe('CSRF Protection Tests', function() {
    let csrfToken, cookie;

    //Gets CSRF token and session cookie before running tests
    before(async function() {
        const tokenResponse = await request(server)
            .get('/csrf-token')
            .expect(200);  //Ensures this request succeeds

        csrfToken = tokenResponse.body.csrfToken;
        cookie = tokenResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');
    });

    describe('Requests with valid CSRF tokens', function() {
        it('should allow the request with a valid CSRF token', async function() {
            let response = await request(server)
                .post('/login')
                .set('Cookie', cookie)
                .send({ Username: 'Max', Password: 'Password123!', _csrf: csrfToken });

            assert.strictEqual(response.status, 200, 'Request with valid CSRF token should succeed');
        });
    });

    describe('Requests with invalid CSRF tokens', function() {
        it('should reject the request with an invalid CSRF token', async function() {
            let response = await request(server)
                .post('/login')
                .set('Cookie', cookie)
                .send({ Username: 'Max', Password: 'Password123!', _csrf: 'invalid-token' });

            assert.strictEqual(response.status, 403, 'Request with invalid CSRF token should be rejected');
        });
    });

    describe('Requests without CSRF tokens', function() {
        it('should reject the request without a CSRF token', async function() {
            let response = await request(server)
                .post('/login')
                .set('Cookie', cookie)
                .send({ Username: 'Max', Password: 'Password123!' });

            assert.strictEqual(response.status, 403, 'Request without CSRF token should be rejected');
        });
    });
});
