import request from 'supertest';
import app from '../src/app';

// ─── Helpers ──────────────────────────────────────────────
let token: string;

async function loginDemo() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'demo@medibox.com', password: 'medibox123' });
  return res.body.data?.token as string;
}

// ─── Auth ─────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('cria usuário com dados válidos', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Teste Jest',
      email: `jest_${Date.now()}@test.com`,
      password: 'senha123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejeita e-mail duplicado', async () => {
    const email = `dup_${Date.now()}@test.com`;
    await request(app).post('/api/auth/register').send({ name: 'A', email, password: '123456' });
    const res = await request(app).post('/api/auth/register').send({ name: 'B', email, password: '123456' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('retorna token com credenciais válidas', async () => {
    const email = `login_${Date.now()}@test.com`;
    await request(app).post('/api/auth/register').send({ name: 'User', email, password: 'abc123' });
    const res = await request(app).post('/api/auth/login').send({ email, password: 'abc123' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it('rejeita senha incorreta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@test.com',
      password: 'errada',
    });
    expect(res.status).toBe(401);
  });
});

// ─── Medications ──────────────────────────────────────────
describe('Medications CRUD', () => {
  let medId: string;

  beforeAll(async () => {
    // Cria usuário e faz login
    const email = `medtest_${Date.now()}@test.com`;
    await request(app).post('/api/auth/register').send({ name: 'Med', email, password: '123456' });
    const res = await request(app).post('/api/auth/login').send({ email, password: '123456' });
    token = res.body.data.token;
  });

  it('GET /api/medications retorna lista vazia', async () => {
    const res = await request(app)
      .get('/api/medications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/medications cria medicamento', async () => {
    const res = await request(app)
      .post('/api/medications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dipirona',
        dosage: '500mg',
        compartment: 1,
        alert_delay_minutes: 30,
        color: 'blue',
        schedules: [{ time: '08:00' }, { time: '20:00' }],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Dipirona');
    expect(res.body.data.schedules).toHaveLength(2);
    medId = res.body.data.id;
  });

  it('GET /api/medications/:id retorna medicamento correto', async () => {
    const res = await request(app)
      .get(`/api/medications/${medId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(medId);
  });

  it('PUT /api/medications/:id atualiza medicamento', async () => {
    const res = await request(app)
      .put(`/api/medications/${medId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dosage: '750mg' });
    expect(res.status).toBe(200);
    expect(res.body.data.dosage).toBe('750mg');
  });

  it('DELETE /api/medications/:id remove medicamento', async () => {
    const res = await request(app)
      .delete(`/api/medications/${medId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/medications/:id retorna 404 após remoção', async () => {
    const res = await request(app)
      .get(`/api/medications/${medId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

// ─── Health ───────────────────────────────────────────────
describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
