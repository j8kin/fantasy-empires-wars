import { getLand, getPlayerLands } from '../../selectors/landSelectors';
import { construct } from '../../map/building/construct';
import { phaserEventBus } from '../../phaser/phaserEventBus';
import { Doctrine } from '../../state/player/PlayerProfile';
import { PREDEFINED_PLAYERS } from '../../domain/player/playerRepository';
import { HeroUnitName } from '../../types/UnitType';
import { BuildingName } from '../../types/Building';
import { WorldMapScene } from '../../phaser/scenes/WorldMapScene';

import { createGameStateStub } from '../../__mocks__/createGameStateStub';
import { mockWorldScene } from '../../__mocks__/mockWorldScene';

describe('World Map Scene. Building Layer', () => {
  let scene: WorldMapScene;

  beforeEach(() => {
    phaserEventBus.removeAllListeners();
    scene = mockWorldScene();
  });

  it.each([
    [HeroUnitName.HAMMER_LORD, Doctrine.MELEE, 'white'],
    [HeroUnitName.RANGER, Doctrine.MELEE, 'green'],
    [HeroUnitName.FIGHTER, Doctrine.MELEE, 'blue'],
    [HeroUnitName.OGR, Doctrine.MELEE, 'red'],
    [HeroUnitName.SHADOW_BLADE, Doctrine.MELEE, 'black'],

    [HeroUnitName.CLERIC, Doctrine.MELEE, 'white'],
    [HeroUnitName.DRUID, Doctrine.MELEE, 'green'],
    [HeroUnitName.ENCHANTER, Doctrine.MELEE, 'blue'],
    [HeroUnitName.PYROMANCER, Doctrine.MELEE, 'red'],
    [HeroUnitName.NECROMANCER, Doctrine.MELEE, 'black'],

    [HeroUnitName.HAMMER_LORD, Doctrine.MAGIC, 'white-green-blue'],
    [HeroUnitName.RANGER, Doctrine.MAGIC, 'white-green-blue'],
    [HeroUnitName.FIGHTER, Doctrine.MAGIC, 'green-blue-red'],
    [HeroUnitName.OGR, Doctrine.MAGIC, 'green-blue-red'],
    [HeroUnitName.SHADOW_BLADE, Doctrine.MAGIC, 'blue-red-black'],

    [HeroUnitName.CLERIC, Doctrine.MAGIC, 'white-green-blue'],
    [HeroUnitName.DRUID, Doctrine.MAGIC, 'white-green-blue'],
    [HeroUnitName.ENCHANTER, Doctrine.MAGIC, 'green-blue-red'],
    [HeroUnitName.PYROMANCER, Doctrine.MAGIC, 'blue-red-black'],
    [HeroUnitName.NECROMANCER, Doctrine.MAGIC, 'blue-red-black'],

    [HeroUnitName.CLERIC, Doctrine.PURE_MAGIC, 'all'],
    [HeroUnitName.DRUID, Doctrine.PURE_MAGIC, 'all'],
    [HeroUnitName.ENCHANTER, Doctrine.PURE_MAGIC, 'all'],
    [HeroUnitName.PYROMANCER, Doctrine.PURE_MAGIC, 'all'],
    [HeroUnitName.NECROMANCER, Doctrine.PURE_MAGIC, 'all'],
  ])(
    '%s player with %s doctrine allowed to build magic tower which rendered as: %s',
    (playerType, doctrine, expectedColor) => {
      const player = { ...PREDEFINED_PLAYERS[0], type: playerType, doctrine };
      const opponent = PREDEFINED_PLAYERS[1];
      const gameState = createGameStateStub({ gamePlayers: [player, opponent] });

      const freePlayerLand = getPlayerLands(gameState).find((l) => l.buildings.length === 0)!;

      construct(gameState, BuildingName.MAGE_TOWER, freePlayerLand.mapPos);
      expect(getLand(gameState, freePlayerLand.mapPos).buildings).toHaveLength(1);
      expect(getLand(gameState, freePlayerLand.mapPos).buildings[0].type).toBe(BuildingName.MAGE_TOWER);

      (scene as any).handleStateUpdate(gameState);
      expect((scene as any).isInitialized).toBe(true);

      const imageCalls = ((scene as any).add.image as jest.Mock).mock.calls;
      const renderedKeys = imageCalls.map((args: any[]) => args[2]); // (x, y, textureKey)
      expect(renderedKeys).toContain(`map-building-mage-tower-${expectedColor}`);
    }
  );

  it.each([
    [BuildingName.STRONGHOLD, 'map-building-stronghold'],
    [BuildingName.BARRACKS, 'map-building-barracks'],
    [BuildingName.WATCH_TOWER, 'map-building-watch-tower'],
    [BuildingName.OUTPOST, 'map-building-outpost'],
  ])('constructs %s and renders it with texture key %s', (buildingName, expectedKey) => {
    const gameState = createGameStateStub({ gamePlayers: [PREDEFINED_PLAYERS[0], PREDEFINED_PLAYERS[1]] });

    const freePlayerLand = getPlayerLands(gameState).find((l) => l.buildings.length === 0)!;
    construct(gameState, buildingName, freePlayerLand.mapPos);
    expect(getLand(gameState, freePlayerLand.mapPos).buildings[0].type).toBe(buildingName);

    (scene as any).handleStateUpdate(gameState);
    expect((scene as any).isInitialized).toBe(true);

    const renderedKeys = ((scene as any).add.image as jest.Mock).mock.calls.map((args: any[]) => args[2]);
    expect(renderedKeys).toContain(expectedKey);
  });
});
