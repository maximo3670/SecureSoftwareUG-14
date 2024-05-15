const assert = require('assert');
const request = require('supertest');
const server = require('../app');

/*
session.test.js

Author: Jonathan Belt
Created: 14/05/2024
Description:
This is a test script written to test the session management of the website

It tests:
1. Session creation upon login
2. Access control for pages that require a session
3. Session expiration

*/

describe('Session Tests', function() {
    let csrfToken, cookie;

    before(async function() {
        const tokenResponse = await request(server)
            .get('/csrf-token')
            .expect(200);

        csrfToken = tokenResponse.body.csrfToken;
        cookie = tokenResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');
    });

    describe('Session creation upon login', function() {
        it('should create a session upon successful login', async function() {
            const response = await request(server)
                .post('/login')
                .set('Cookie', cookie)
                .send({ Username: 'Max', Password: 'Password123!', _csrf: csrfToken });

            assert.strictEqual(response.status, 200, 'Failed to log in with correct credentials');
            assert(response.headers['set-cookie'], 'No session cookie set');
        });
    });

    describe('Access control for pages that require a session', function() {
        let sessionCookie;

        before(async function() {
            const loginResponse = await request(server)
                .post('/login')
                .set('Cookie', cookie)
                .send({ Username: 'Max', Password: 'Password123!', _csrf: csrfToken });

            sessionCookie = loginResponse.headers['set-cookie'].find(cookie => cookie.startsWith('session'));
        });

        it('should deny access to a protected page without a session', async function() {
            const response = await request(server)
                .get('/readUserBlogs')
                .expect(401);

            assert.strictEqual(response.body.message, "This action requires you to be logged in.");
        });

        it('should allow access to a protected page with a valid session', async function() {
            const response = await request(server)
                .get('/readUserBlogs')
                .set('Cookie', sessionCookie)
                .expect(200);

            assert(Array.isArray(response.body), 'Expected an array of blogs');
        });
    });

    describe('Session expiration', function() {
        let sessionCookie;

        before(async function() {
            const loginResponse = await request(server)
                .post('/login')
                .set('Cookie', cookie)
                .send({ Username: 'Max', Password: 'Password123!', _csrf: csrfToken });

            sessionCookie = loginResponse.headers['set-cookie'].find(cookie => cookie.startsWith('session'));
            console.log('Session created at:', new Date());
        });

        it('should expire the session after inactivity', function(done) {
            this.timeout(320000); // Extend the timeout to handle the wait time plus some buffer

            console.log('Waiting for session to expire...');
            setTimeout(async () => {
                const response = await request(server)
                    .get('/check-session')
                    .set('Cookie', sessionCookie)
                    .expect(200);

                console.log('Session checked at:', new Date());
                console.log('Session status:', response.body.loggedIn);
                assert.strictEqual(response.body.loggedIn, false, 'Session did not expire after inactivity');
                done();
            }, 310000); // Wait for 310 seconds before checking the session
        });
    });
});
