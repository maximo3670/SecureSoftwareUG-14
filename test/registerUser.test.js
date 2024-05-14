const assert = require('assert');
const request = require('supertest');
const server = require('../app');

describe('Register User Tests', function(){
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

    describe('Registering a User', function() {
        it('Should register a new user with vaild details', async function() {
            let response;
            try {
                response = await request(server)
                    .post('/register')
                    .set('Cookie', cookie)
                    .set('CSRF-Token', csrfToken)
                    .send({Username: 'Ed', Password: 'Password123!', ConfirmPassword: 'Password123!', Firstname: 'Ed', Lastname: 'Ward', Email: 'wardy2@live.co.uk', _csrf: csrfToken});

                console.log(response.body);

                assert.strictEqual(response.status, 200, 'Failed to register a new user!');
                assert.strictEqual(response.body.message, 'User Registered Successfully!', 'Unexpected response message');

            } catch (error){
                assert.fail(`Registration Request failed: ${error.message}`);
            }

        });

    });

});