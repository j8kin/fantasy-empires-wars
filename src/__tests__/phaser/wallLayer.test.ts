import { getLand, getPlayerLands } from '../../selectors/landSelectors';
import { construct } from '../../map/building/construct';
import { phaserEventBus } from '../../phaser/phaserEventBus';
import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { BuildingName } from '../../types/Building';
import { WALL_TEXTURE } from '../../assets/getWallSegmentImg';
import { WorldMapScene } from '../../phaser/scenes/WorldMapScene';

import { createGameStateStub } from '../../__mocks__/createGameStateStub';
import { mockWorldScene } from '../../__mocks__/mockWorldScene';

describe('World Map Scene. Wall Layer', () => {
  let scene: WorldMapScene;

  beforeEach(() => {
    phaserEventBus.removeAllListeners();
    scene = mockWorldScene();
  });

  it('renders wall segments on boundary edges of a land with a wall building', () => {
    const gameState = createGameStateStub({ gamePlayers: [PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[1]] });

    // Build a wall on a player land that borders unowned territory
    const freePlayerLand = getPlayerLands(gameState).find((l) => l.buildings.length === 0)!;
    construct(gameState, BuildingName.WALL, freePlayerLand.mapPos);
    expect(getLand(gameState, freePlayerLand.mapPos).buildings[0].type).toBe(BuildingName.WALL);

    (scene as any).handleStateUpdate(gameState);
    expect((scene as any).isInitialized).toBe(true);

    const renderedKeys = ((scene as any).add.image as jest.Mock).mock.calls.map((args: any[]) => args[2]);
    const wallSegmentKeys = renderedKeys.filter((k: string) => k === WALL_TEXTURE.ANGLE || k === WALL_TEXTURE.VERTICAL);
    expect(wallSegmentKeys.length).toBeGreaterThan(0);
  });
});
