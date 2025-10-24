import { generateMap } from '../map/generation/generateMap';
import { LAND_TYPE } from '../types/Land';
import { NO_PLAYER } from '../types/GamePlayer';
import { BattlefieldDimensions } from '../types/GameState';
import { defaultBattlefieldSizeStub } from './utils/createGameStateStub';

describe('Map Generation', () => {
  it.each([
    ['small', { rows: 6, cols: 13 }],
    ['medium', { rows: 9, cols: 18 }],
    ['large', { rows: 11, cols: 23 }],
    ['huge', { rows: 15, cols: 31 }],
    ['test default', defaultBattlefieldSizeStub],
  ])('should generate map for %s size', (size: string, dimensions: BattlefieldDimensions) => {
    const lands = generateMap(dimensions);

    // Should generate tiles
    expect(Object.keys(lands).length).toBeGreaterThan(0);

    // All tiles should be controlled by a neutral player
    Object.values(lands.lands).forEach((land) => {
      expect(land.controlledBy).toBe(NO_PLAYER.id);
    });

    // Should have volcano and lava tiles
    const volcanoTiles = Object.values(lands.lands).filter(
      (land) => land.land.id === LAND_TYPE.VOLCANO
    );
    const lavaTiles = Object.values(lands.lands).filter((land) => land.land.id === LAND_TYPE.LAVA);

    expect(volcanoTiles.length).toBe(1);
    expect(lavaTiles.length).toBeGreaterThan(0);
  });
});
