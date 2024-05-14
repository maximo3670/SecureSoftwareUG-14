const assert = require('assert');
const request = require('supertest');
const server = require('../app');

/*
XSS.test.js

Author: Max Neil
Created: 12/05/2024
Description:
This is a test script written to test the system security against cross site scripting attacks
it attempts the insert malicious code into the webpage.

It tests:
All forms on the webpage against XSS inputs

*/

describe('XSS Attack Prevention Tests', function() {
    let csrfToken, cookie;

    before(async function() {
        // Fetch the CSRF token using the session cookie
        const tokenResponse = await request(server)
            .get('/csrf-token');
    
        // Store the CSRF token from the response
        csrfToken = tokenResponse.body.csrfToken;
        cookie = tokenResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');

        // Log in to get the session cookie
        const loginResponse = await request(server)
            .post('/login')
            .set('Cookie', cookie)
            .send({ Username: 'Max', Password: 'Password123!', _csrf: csrfToken });

        let loginCookies = loginResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]);
        loggedInCookie = `${cookie}; ${loginCookies.join(';')}`;
    });

    it('should allow login even with XSS as it is sanitised', async function() {
        let response = await request(server)
            .post('/login')
            .set('Cookie', cookie)
            .set('CSRF-Token', csrfToken)
            .send({ Username: "Max<script>alert('xss');</script>", Password: "Password123!<script>alert('xss');</script>" });

        assert.strictEqual(response.status, 200, 'Expected login to succeed since inputs should be sanitized');
    });


    it('should prevent XSS in registration with CSRF token', async function() {
        let response = await request(server)
            .post('/register')
            .set('Cookie', cookie)
            .set('CSRF-Token', csrfToken)
            .send({
                Username: "XSStestUser<script>alert('xss');</script>",
                Password: "ValidPassword1!",
                ConfirmPassword: "ValidPassword1!",
                Firstname: "<script>alert('xss');</script>",
                Lastname: "<script>alert('xss');</script>",
                Email: "XSStestUser@example.com<script>"
            });
            assert.strictEqual(response.status, 409, 'Expected failure due to duplicate username or email');
            assert.match(response.body.message, /Username or email already exists/, 'Expected error message about duplicate username or email');
    });

    it('should prevent XSS in blog writing with CSRF token', async function() {
        let response = await request(server)
            .post('/writeblog')
            .set('Cookie', loggedInCookie)
            .set('CSRF-Token', csrfToken)
            .send({
                title: "This is part of XSS testing <script>alert('xss');</script>",
                text: "This is part of XSS testing <script>alert('xss');</script>"
            });
        assert.strictEqual(response.status, 201, 'Expected blog writing to succeed since inputs should be sanitized');
    });
});
