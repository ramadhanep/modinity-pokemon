const db = require('../db');
const Favorites = require('../models/favorites.model');
const Team = require('../models/team.model');

beforeEach(() => {
  // Clean tables between tests
  db.prepare('DELETE FROM team_members').run();
  db.prepare('DELETE FROM favorites').run();
  // Reset autoincrement counters (use single quotes for string literals)
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('favorites','team_members')").run();
});

describe('Models: favorites', () => {
  test('create and list favorites', () => {
    const row = Favorites.createFavorite({ pokemonId: 25, name: 'Pikachu', sprite: null, types: ['electric'] });
    expect(row.id).toBeTruthy();
    expect(row.types).toEqual(['electric']);
    const all = Favorites.listFavorites();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('Pikachu');
  });

  test('duplicate pokemonId should throw unique error', () => {
    Favorites.createFavorite({ pokemonId: 25, name: 'Pikachu' });
    expect(() => Favorites.createFavorite({ pokemonId: 25, name: 'Pika Again' })).toThrow();
  });

  test('delete favorite by id', () => {
    const row = Favorites.createFavorite({ pokemonId: 7, name: 'Squirtle' });
    const changes = Favorites.deleteFavoriteById(row.id);
    expect(changes).toBe(1);
  });
});

describe('Models: team', () => {
  test('create and list team members', () => {
    const row = Team.createTeamMember({ pokemonId: 1, name: 'Bulbasaur' });
    expect(row.id).toBeTruthy();
    const all = Team.listTeamMembers();
    expect(all.length).toBe(1);
    expect(all[0].name).toBe('Bulbasaur');
  });

  test('team max 6 constraint throws', () => {
    for (let i = 1; i <= 6; i++) {
      Team.createTeamMember({ pokemonId: 100 + i, name: `Poke ${i}` });
    }
    expect(() => Team.createTeamMember({ pokemonId: 999, name: 'Overflow' })).toThrow();
  });

  test('delete team member by id', () => {
    const row = Team.createTeamMember({ pokemonId: 2, name: 'Ivysaur' });
    const changes = Team.deleteTeamMemberById(row.id);
    expect(changes).toBe(1);
  });
});
