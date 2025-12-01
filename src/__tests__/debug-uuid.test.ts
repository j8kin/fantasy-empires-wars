import { armyFactory } from '../factories/armyFactory';
import { getTurnOwner } from '../selectors/playerSelectors';
import { createDefaultGameStateStub } from './utils/createGameStateStub';

describe('UUID Debug Test', () => {
  it('should generate unique IDs for armies', () => {
    const gameState = createDefaultGameStateStub();
    const turnOwner = getTurnOwner(gameState);
    const position = { row: 0, col: 0 };

    // Create multiple armies
    const army1 = armyFactory(turnOwner.id, position);
    const army2 = armyFactory(turnOwner.id, position);
    const army3 = armyFactory(turnOwner.id, position);

    console.log('Army 1 ID:', army1.id);
    console.log('Army 2 ID:', army2.id);
    console.log('Army 3 ID:', army3.id);

    // They should have different IDs
    expect(army1.id).not.toBe(army2.id);
    expect(army2.id).not.toBe(army3.id);
    expect(army1.id).not.toBe(army3.id);

    // All IDs should be strings
    expect(typeof army1.id).toBe('string');
    expect(typeof army2.id).toBe('string');
    expect(typeof army3.id).toBe('string');

    // IDs should not be empty
    expect(army1.id.length).toBeGreaterThan(0);
    expect(army2.id.length).toBeGreaterThan(0);
    expect(army3.id.length).toBeGreaterThan(0);
  });
});
