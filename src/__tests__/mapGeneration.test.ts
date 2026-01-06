import { getMainSpecialLandKinds, getNearSpecialLandKinds } from '../domain/land/landRelationships';
import { generateMap } from '../map/generation/generateMap';
import { LandName } from '../types/Land';
import { defaultBattlefieldSizeStub } from './utils/createGameStateStub';
import type { MapDimensions } from '../state/map/MapDimensions';

describe('Map Generation', () => {
  it.each([
    ['small', { rows: 6, cols: 13 }],
    ['medium', { rows: 9, cols: 18 }],
    ['large', { rows: 11, cols: 23 }],
    ['huge', { rows: 15, cols: 31 }],
    ['test default', defaultBattlefieldSizeStub],
  ])('should generate map for %s size', (size: string, dimensions: MapDimensions) => {
    const lands = generateMap(dimensions);

    // Should generate tiles
    expect(Object.keys(lands).length).toBeGreaterThan(0);

    // All tiles should be controlled by a neutral player
    Object.values(lands.lands).forEach((land) => {
      expect(land.land.id).not.toBe(LandName.NONE);
      expect(land.goldPerTurn).toBeGreaterThan(0);
    });

    // Special lands should be generated
    getMainSpecialLandKinds().forEach((LandKind) => {
      expect(Object.values(lands.lands).some((land) => land.land.id === LandKind)).toBeTruthy();
      expect(Object.values(lands.lands).filter((land) => land.land.id === LandKind)).toHaveLength(
        1
      );
      expect(
        Object.values(lands.lands).some(
          (land) => land.land.id === getNearSpecialLandKinds(LandKind)
        )
      ).toBeTruthy();
      expect(
        Object.values(lands.lands).filter(
          (land) => land.land.id === getNearSpecialLandKinds(LandKind)
        ).length
      ).toBeGreaterThan(1);
      expect(
        Object.values(lands.lands).filter(
          (land) => land.land.id === getNearSpecialLandKinds(LandKind)
        ).length
      ).toBeLessThan(6);
    });
  });
});
