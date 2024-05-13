const assert = require('assert');
const request = require('supertest');
const server = require('../app');

describe('XSS Attack Prevention Tests with Session and CSRF Token', function() {
    let csrfToken, cookie;

    before(async function() {
        // Log in to get the session cookie
        const loginResponse = await request(server)
            .post('/login')
            .send({ Username: 'Max', Password: 'Password123!' });

        // Extract and store the cookie
        const cookies = loginResponse.headers['set-cookie'];
        cookie = cookies.map(cookie => cookie.split(';')[0]).join(';');

        // Fetch the CSRF token using the session cookie
        const tokenResponse = await request(server)
            .get('/csrf-token')
            .set('Cookie', cookie);

        // Store the CSRF token from the response
        csrfToken = tokenResponse.body.csrfToken;
    });

    it('should prevent XSS in login with CSRF token', async function() {
        let response = await request(server)
            .post('/login')
            .set('Cookie', cookie)
            .set('CSRF-Token', csrfToken)
            .send({ Username: "<script>alert('xss');</script>", Password: "<script>alert('xss');</script>" });

        console.log('Response:', response.body); // Debug response body
        assert.strictEqual(response.status, 200, 'Expected login to succeed since inputs should be sanitized');
    });


    it('should prevent XSS in registration with CSRF token', async function() {
        let response = await request(server)
            .post('/register')
            .set('Cookie', cookie)
            .set('CSRF-Token', csrfToken)
            .send({
                Username: "<script>alert('xss');</script>",
                Password: "ValidPassword1!",
                ConfirmPassword: "ValidPassword1!",
                Firstname: "<script>alert('xss');</script>",
                Lastname: "<script>alert('xss');</script>",
                Email: "test@example.com<script>"
            });
        assert.strictEqual(response.status, 201, 'Expected registration to succeed since inputs should be sanitized');
    });

    it('should prevent XSS in blog writing with CSRF token', async function() {
        let response = await request(server)
            .post('/writeblog')
            .set('Cookie', cookie)
            .set('CSRF-Token', csrfToken)
            .send({
                title: "<script>alert('xss');</script>",
                text: "<script>alert('xss');</script>"
            });
        assert.strictEqual(response.status, 201, 'Expected blog writing to succeed since inputs should be sanitized');
    });

    it('should prevent XSS in blog updating with CSRF token', async function() {
        let response = await request(server)
            .post('/updateBlog')
            .set('Cookie', cookie)
            .set('CSRF-Token', csrfToken)
            .send({
                blogid: '123',
                title: "<script>alert('xss');</script>",
                text: "<script>alert('xss');</script>"
            });
        assert.strictEqual(response.status, 200, 'Expected blog update to succeed since inputs should be sanitized');
    });
});
