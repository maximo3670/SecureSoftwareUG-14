const request = require('supertest');
const app = require('../app'); // Path to your Express app file

describe('POST /send-email', () => {
    it('should send an email', async () => {
        const res = await request(app)
            .post('/send-email')
            .send({
                Username: 'testuser',
                subject: 'Test Subject',
                html: '<h1>Test HTML Content</h1>'
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe('POST /login', () => {
    it('should login successfully', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                // Provide login credentials if required
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});