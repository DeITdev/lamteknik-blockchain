import request from 'supertest';

describe('API Health E2E', () => {
  it('GET /api/v1/health returns 200', async () => {
    const response = await request('http://127.0.0.1:3001').get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
  });
});
