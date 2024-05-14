const assert = require('assert');
const request = require('supertest');
const server = require('../app');
const {pool} = require('../db')

/*
    registerUser.test.js

    Author: Edward Ward

    Created: 12/05/2024

    Description:
    This is a Test Script to check Register User Function of the Website

    It tests:
    1. A new User can Register
    2. The Email address is Encrypted 
    3. The Password is Encrypted

*/

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
                    .send({Username: 'TestUser', Password: 'Password123!', ConfirmPassword: 'Password123!', Firstname: 'Test', Lastname: 'User', Email: 'TestUsers2@mail.com', _csrf: csrfToken});

                console.log(response.body);

                assert.strictEqual(response.status, 201, 'Failed to register a new user with correct inputs!');
                assert.strictEqual(response.body.success, true, 'Registration not successful');

            } catch (error){
                assert.fail(`Registration Request failed: ${error.message}`);
            }

        });

    });


    describe('Checking if Email is Encrypted', function() {
        it('Should return an encrypted email address of a user', async function() {
            
            try {
                const username = 'TestUser';

                const userQuery = 'SELECT * FROM securesoftware.users WHERE username = $1';

                const user = await pool.query(userQuery,[username]);

                assert(user.rows.length > 0, 'user not found!');

                const encryptedEmail = user.rows[0].email;
            
                console.log(encryptedEmail);

                assert.notStrictEqual(encryptedEmail, 'TestUsers2@mail.com', 'Email address is not encrypted');

            } catch (error) {
                assert.fail(`Error: ${error.message}`);
            }

        });

    });

    describe('Checking if Password is Encrypted', function(){
        it('Should return an encrypted Password of the User', async function() {
            try {
                const username = 'TestUser';

                const userQuery = 'SELECT * FROM securesoftware.users WHERE username = $1';

                const user = await pool.query(userQuery,[username]);

                assert(user.rows.length > 0, 'user not found!' );

                const encryptedPassword = user.rows[0].password;

                console.log(encryptedPassword);

                assert.notStrictEqual(encryptedPassword, 'Password123!', 'Password is not encrypted!');
            } catch (error) {
                assert.fail(`Error: ${error.message}`)
            }
        });
    });

});