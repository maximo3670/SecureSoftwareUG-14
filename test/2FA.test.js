const assert = require('assert');
const request = require('supertest');
const app = require('../app');

/*
2FA.test.js

Author: Mitchell Layzell
Created: 14/05/2024
Description:
This is a test script to determine if the web application will send emails to a reciepient.
It also generates a 3 digit code that will be used in the emails for loginHandler.js
*/

describe('Email 2FA Tests', function() {
    let csrfToken, cookie, storedOTP;

    // Fetch CSRF token and session cookie before running tests
    before(async function() {
        const tokenResponse = await request(app)
            .get('/csrf-token')
            .expect(200);  // Ensure the request succeeds

        csrfToken = tokenResponse.body.csrfToken;
        cookie = tokenResponse.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join(';');
    });

    describe('Generating a 6 digit code to be used for the email', function() {
        it('Should generate a randomised 6 digit password for a user to use.', function(){
            storedOTP = Math.floor(Math.random() * 900000) + 100000;
            assert.strictEqual(typeof storedOTP, 'number', 'OTP should be a number');
            assert.ok(Number.isInteger(storedOTP), 'OTP should be an integer');
            assert.ok(storedOTP >= 100000, 'OTP should be at least 100000');
            assert.ok(storedOTP < 1000000, 'OTP should be less than 1000000');
        });        
    });

    describe('Send a test email', function(){
        it('Should send an email to the test destination alongside the code that was generated prior by calling on /send-email', async function(){
            try{
                const res = await request(app)
                    .post('/send-email') //Calls the send-email function from app
                    .send({ //Creating email data 
                        Username: 'Max', 
                        subject: 'This test was successful',
                        text:'',
                        html: `<h1>Test Content</h1>
                        <h1>${storedOTP}</h1>`,
                        _csrf: csrfToken
                    })
                    .set('Cookie', cookie); // Set the session cookie
    
                assert.strictEqual(res.status, 200, 'Response status should be 200');
                assert.strictEqual(res.body.message, 'Email sent successfully', 'Response message should indicate successful email sending');
            } catch(error) {
                assert.fail(`Email did not send: ${error.message}`);
            }
        });
    });
});