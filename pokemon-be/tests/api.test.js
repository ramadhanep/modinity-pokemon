const request = require('supertest');

// Ensure env is set before requiring app (setup also sets it)
process.env.DATABASE_URL = process.env.DATABASE_URL || ':memory:';

const app = require('../app');
const db = require('../db');

beforeEach(() => {
  db.prepare('DELETE FROM team_members').run();
  db.prepare('DELETE FROM favorites').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('favorites','team_members')").run();
});

describe('API: /api/favorites', () => {
  test('POST then GET', async () => {
    const create = await request(app)
      .post('/api/favorites')
      .send({ pokemonId: 25, name: 'Pikachu', types: ['electric'] })
      .expect(201);
    expect(create.body.name).toBe('Pikachu');

    const list = await request(app).get('/api/favorites').expect(200);
    expect(list.body.length).toBe(1);
  });

  test('duplicate returns 400 DUPLICATE', async () => {
    await request(app)
      .post('/api/favorites')
      .send({ pokemonId: 25, name: 'Pikachu' })
      .expect(201);
    const dup = await request(app)
      .post('/api/favorites')
      .send({ pokemonId: 25, name: 'Pikachu' })
      .expect(400);
    expect(dup.body.code).toBe('DUPLICATE');
  });
});

describe('API: /api/team', () => {
  test('POST then GET', async () => {
    const create = await request(app)
      .post('/api/team')
      .send({ pokemonId: 1, name: 'Bulbasaur' })
      .expect(201);
    expect(create.body.name).toBe('Bulbasaur');

    const list = await request(app).get('/api/team').expect(200);
    expect(list.body.length).toBe(1);
  });

  test('max 6 returns TEAM_FULL', async () => {
    for (let i = 1; i <= 6; i++) {
      await request(app).post('/api/team').send({ pokemonId: 100 + i, name: `P${i}` });
    }
    const resp = await request(app)
      .post('/api/team')
      .send({ pokemonId: 999, name: 'Overflow' })
      .expect(400);
    expect(resp.body.code).toBe('TEAM_FULL');
  });
});
