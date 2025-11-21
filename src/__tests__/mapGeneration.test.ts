import { generateMap } from '../map/generation/generateMap';
import { getMainSpecialLandTypes, getNearSpecialLandTypes, LandType } from '../types/Land';
import { NO_PLAYER } from '../types/PlayerState';
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
      expect(land.land.id).not.toBe(LandType.NONE);
      expect(land.goldPerTurn).toBeGreaterThan(0);
    });

    // Special lands should be generated
    getMainSpecialLandTypes().forEach((landType) => {
      expect(Object.values(lands.lands).some((land) => land.land.id === landType)).toBeTruthy();
      expect(Object.values(lands.lands).filter((land) => land.land.id === landType).length).toBe(1);
      expect(
        Object.values(lands.lands).some(
          (land) => land.land.id === getNearSpecialLandTypes(landType)
        )
      ).toBeTruthy();
      expect(
        Object.values(lands.lands).filter(
          (land) => land.land.id === getNearSpecialLandTypes(landType)
        ).length
      ).toBeGreaterThan(1);
      expect(
        Object.values(lands.lands).filter(
          (land) => land.land.id === getNearSpecialLandTypes(landType)
        ).length
      ).toBeLessThan(6);
    });
  });
});
