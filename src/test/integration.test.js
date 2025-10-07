process.env.DATABASE_URL = ':memory:';
process.env.JWT_SECRET = 'test_jwt_secret';

const request = require('supertest');
const app = require('../server');
const { run, get, all, db } = require('../config/db');

beforeEach(async () => {
  await run('DELETE FROM transfers', []);
  await run('DELETE FROM users', []);
});

afterAll(async () => {
  await new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('Fluxo: criar usuários, login, transferir e histórico', () => {
  test('cria dois usuários, loga, transfere e verifica histórico', async () => {
    // cria user1
    const r1 = await request(app)
      .post('/users')
      .send({ name: 'User 1', email: 'u1@test.local', password: '123456' });
    expect(r1.status).toBe(201);
    expect(r1.body).toHaveProperty('id');

    // cria user2
    const r2 = await request(app)
      .post('/users')
      .send({ name: 'User 2', email: 'u2@test.local', password: '123456' });
    expect(r2.status).toBe(201);
    expect(r2.body).toHaveProperty('id');

    // login user1
    const login = await request(app)
      .post('/login')
      .send({ email: 'u1@test.local', password: '123456' });
    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty('token');
    const token = login.body.token || login.body?.token; // depende do formato

    // realiza transferência de u1 -> u2 (R$50 = 5000 centavos)
    const transf = await request(app)
      .post('/transfers')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiverEmail: 'u2@test.local', amount: 5000 });
    expect([200, 201]).toContain(transf.status);

    // consulta histórico de user1
    const history = await request(app)
      .get('/history')
      .set('Authorization', `Bearer ${token}`);
    expect(history.status).toBe(200);
    expect(Array.isArray(history.body)).toBe(true);
    expect(history.body.length).toBeGreaterThanOrEqual(1);

    // adicional: validar saldos no DB
    const sender = await get('SELECT * FROM users WHERE email = ?', [
      'u1@test.local',
    ]);
    const receiver = await get('SELECT * FROM users WHERE email = ?', [
      'u2@test.local',
    ]);
    expect(sender.balance_cents).toBe(10000 - 5000);
    expect(receiver.balance_cents).toBe(10000 + 5000);
  });
});
