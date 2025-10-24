import { battlefieldLandId } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { construct } from '../map/building/construct';
import { BuildingType } from '../types/Building';
import { getLands, LandPosition } from '../map/utils/getLands';
import { recruitWarriors } from '../map/army/recruit';
import { getUnit, UnitType } from '../types/Army';
import {
  createDefaultGameStateStub,
  defaultBattlefieldSizeStub,
} from './utils/createGameStateStub';
import { GamePlayer } from '../types/GamePlayer';

describe('Construct Buildings', () => {
  let gameStateStub = createDefaultGameStateStub();

  const player1 = gameStateStub.players[0];
  const player2 = gameStateStub.players[1];

  const getPlayerLands = (player: GamePlayer) =>
    getLands({
      lands: gameStateStub.battlefield.lands,
      players: [player],
    }).map((land) => battlefieldLandId(land.mapPos));

  beforeEach(() => {
    // clear map to remove all armies and buildings
    gameStateStub.battlefield = generateMockMap(defaultBattlefieldSizeStub);
    gameStateStub.turnOwner = gameStateStub.players[0].id;
  });

  describe('Constructing a building', () => {
    it('Build one Stronghold', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      const player1Lands = getPlayerLands(player1);

      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      expect(player1Lands).toContain('2-5');
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      expect(player1Lands).toContain('3-5');
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      expect(player1Lands).toContain('4-5');
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');

      // no other lands should be in the player's land's
      expect(player1Lands.length).toBe(19);
    });

    it('Build two Strongholds for two players, no intersection', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 8 });

      const player1Lands = getLands({
        lands: gameStateStub.battlefield.lands,
        players: [player1],
      }).map((land) => battlefieldLandId(land.mapPos));
      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      expect(player1Lands).toContain('2-5');
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      expect(player1Lands).toContain('3-5');
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      expect(player1Lands).toContain('4-5');
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');
      // no other lands should be in the player's land's

      expect(player1Lands.length).toBe(19);

      const player2Lands = getPlayerLands(player2);
      // row 1
      expect(player2Lands).toContain('1-7');
      expect(player2Lands).toContain('1-8');
      expect(player2Lands).toContain('1-9');
      // row 2
      expect(player2Lands).toContain('2-7');
      expect(player2Lands).toContain('2-8');
      expect(player2Lands).toContain('2-9');
      expect(player2Lands).toContain('2-10');
      // row 3
      expect(player2Lands).toContain('3-6');
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      expect(player2Lands).toContain('3-9');
      expect(player2Lands).toContain('3-10');
      // row 4
      expect(player2Lands).toContain('4-7');
      expect(player2Lands).toContain('4-8');
      expect(player2Lands).toContain('4-9');
      expect(player2Lands).toContain('4-10');
      // row 5
      expect(player2Lands).toContain('5-7');
      expect(player2Lands).toContain('5-8');
      expect(player2Lands).toContain('5-9');
      // no other lands should be in the player's land's

      expect(player2Lands.length).toBe(19);
    });

    it('Build two Strongholds for two players, has intersection radius 1 no building on intersection', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 7 });

      const player1Lands = getPlayerLands(player1);
      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      expect(player1Lands).toContain('2-5');
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      // land 5 on row 3 owned by player 2
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      expect(player1Lands).toContain('4-5');
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');

      //no other lands should be in the player's land's
      expect(player1Lands.length).toBe(18);

      const player2Lands = getPlayerLands(player2);
      // row 1
      expect(player2Lands).toContain('1-6');
      expect(player2Lands).toContain('1-7');
      expect(player2Lands).toContain('1-8');
      // row 2
      expect(player2Lands).toContain('2-6');
      expect(player2Lands).toContain('2-7');
      expect(player2Lands).toContain('2-8');
      expect(player2Lands).toContain('2-9');
      // row 3
      expect(player2Lands).toContain('3-5');
      expect(player2Lands).toContain('3-6');
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      expect(player2Lands).toContain('3-9');
      // row 4
      expect(player2Lands).toContain('4-6');
      expect(player2Lands).toContain('4-7');
      expect(player2Lands).toContain('4-8');
      expect(player2Lands).toContain('4-9');
      // row 5
      expect(player2Lands).toContain('5-6');
      expect(player2Lands).toContain('5-7');
      expect(player2Lands).toContain('5-8');
      // no other lands should be in the player's land's

      expect(player2Lands.length).toBe(19);
    });

    it('Build two Strongholds for two players, has intersection radius 2 no building on intersection', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 6 });

      const player1Lands = getPlayerLands(player1);
      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      // land 5 on row 2 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      // land 5 on row 3 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      // land 5 on row 4 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');

      //no other lands should be in the player's land's
      expect(player1Lands.length).toBe(16);

      const player2Lands = getPlayerLands(player2);
      // row 1
      expect(player2Lands).toContain('1-5');
      expect(player2Lands).toContain('1-6');
      expect(player2Lands).toContain('1-7');
      // row 2
      expect(player2Lands).toContain('2-5');
      expect(player2Lands).toContain('2-6');
      expect(player2Lands).toContain('2-7');
      expect(player2Lands).toContain('2-8');
      // row 3
      // land 4 on row 3 owned by player 1 since it is in radius 1 from player 1 stronghold (3-3)
      expect(player2Lands).toContain('3-5');
      expect(player2Lands).toContain('3-6');
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      // row 4
      expect(player2Lands).toContain('4-5');
      expect(player2Lands).toContain('4-6');
      expect(player2Lands).toContain('4-7');
      expect(player2Lands).toContain('4-8');
      // row 5
      expect(player2Lands).toContain('5-5');
      expect(player2Lands).toContain('5-6');
      expect(player2Lands).toContain('5-7');
      // no other lands should be in the player's land's

      expect(player2Lands.length).toBe(18);
    });

    it('Build two Strongholds for two players, has intersection radius 2 with building on intersection', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      construct(gameStateStub, BuildingType.BARRACKS, { row: 3, col: 5 });
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 6 });

      const player1Lands = getPlayerLands(player1);
      // row 1
      expect(player1Lands).toContain('1-2');
      expect(player1Lands).toContain('1-3');
      expect(player1Lands).toContain('1-4');
      // row 2
      expect(player1Lands).toContain('2-2');
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      // land 5 on row 2 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 3
      expect(player1Lands).toContain('3-1');
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      expect(player1Lands).toContain('3-5'); // building on intersection
      // row 4
      expect(player1Lands).toContain('4-2');
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      // land 5 on row 4 owned by player 2 since it is in radius 2 from player 1 stronghold (3-3)
      // row 5
      expect(player1Lands).toContain('5-2');
      expect(player1Lands).toContain('5-3');
      expect(player1Lands).toContain('5-4');

      //no other lands should be in the player's land's
      expect(player1Lands.length).toBe(17);

      const player2Lands = getPlayerLands(player2);
      // row 1
      expect(player2Lands).toContain('1-5');
      expect(player2Lands).toContain('1-6');
      expect(player2Lands).toContain('1-7');
      // row 2
      expect(player2Lands).toContain('2-5');
      expect(player2Lands).toContain('2-6');
      expect(player2Lands).toContain('2-7');
      expect(player2Lands).toContain('2-8');
      // row 3
      // land 4 on row 3 owned by player 1 since it is in radius 1 from player 1 stronghold (3-3)
      // building on intersection 3-5 (still owned by player 1
      expect(player2Lands).toContain('3-6');
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      // row 4
      expect(player2Lands).toContain('4-5');
      expect(player2Lands).toContain('4-6');
      expect(player2Lands).toContain('4-7');
      expect(player2Lands).toContain('4-8');
      // row 5
      expect(player2Lands).toContain('5-5');
      expect(player2Lands).toContain('5-6');
      expect(player2Lands).toContain('5-7');
      // no other lands should be in the player's land's

      expect(player2Lands.length).toBe(17);
    });
  });

  describe('Demolition building', () => {
    const strongholdPos: LandPosition = { row: 3, col: 3 };
    const buildingPos: LandPosition = { row: 3, col: 4 };

    it('Build one Stronghold and one Demolition', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      expect(
        gameStateStub.battlefield.lands[battlefieldLandId(strongholdPos)].buildings.length
      ).toBe(0);

      const player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(0);
    });

    it('Demolition non-stronghold', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);
      construct(gameStateStub, BuildingType.DEMOLITION, buildingPos);

      // stronghold is not destroyed
      expect(
        gameStateStub.battlefield.lands[battlefieldLandId(strongholdPos)].buildings[0].id
      ).toBe(BuildingType.STRONGHOLD);

      // barracks is destroyed
      expect(gameStateStub.battlefield.lands[battlefieldLandId(buildingPos)].buildings.length).toBe(
        0
      );

      // no player lands destroyed
      const player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(19);
    });

    it('Demolition not destroy buildings on other lands', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold is destroyed
      expect(
        gameStateStub.battlefield.lands[battlefieldLandId(strongholdPos)].buildings.length
      ).toBe(0);

      // barracks is not destroyed
      expect(gameStateStub.battlefield.lands[battlefieldLandId(buildingPos)].buildings[0].id).toBe(
        BuildingType.BARRACKS
      );

      // no player lands exist
      const player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(0);
    });

    it('When stronghold destroyed lands with army not lost players control', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);

      recruitWarriors(
        getUnit(UnitType.FIGHTER),
        gameStateStub.battlefield.lands[battlefieldLandId(buildingPos)]
      );
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold is destroyed
      expect(
        gameStateStub.battlefield.lands[battlefieldLandId(strongholdPos)].buildings.length
      ).toBe(0);

      // barracks is not destroyed
      expect(gameStateStub.battlefield.lands[battlefieldLandId(buildingPos)].buildings[0].id).toBe(
        BuildingType.BARRACKS
      );
      // army is not lost
      expect(gameStateStub.battlefield.lands[battlefieldLandId(buildingPos)].army.length).toBe(1);

      // no player lands exist
      const player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(1);
      expect(player1Lands[0]).toBe(battlefieldLandId(buildingPos));
    });

    it('When stronghold destroyed land could change owner', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 6 });

      let player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(16);
      let player2Lands = getPlayerLands(player2);
      expect(player2Lands.length).toBe(18);
      expect(gameStateStub.battlefield.lands['3-4'].controlledBy).toBe(player1.id);

      // DEMOLITION
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // no player lands exist
      player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(0);
      // player2 lands increased
      player2Lands = getPlayerLands(player2);
      expect(player2Lands.length).toBe(19);

      expect(gameStateStub.battlefield.lands['3-4'].controlledBy).toBe(player2.id); // now controlled by player 2
    });

    it('When stronghold destroyed land not change owner if another stronghold of the same owner is near', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 1, col: 5 }); // stronghold of player 1 near destroyed land
      gameStateStub.turnOwner = gameStateStub.players[1].id;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 6 });

      let player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(24);
      let player2Lands = getPlayerLands(player2);
      expect(player2Lands.length).toBe(14);

      expect(gameStateStub.battlefield.lands['3-4'].controlledBy).toBe(player1.id); // under player 1 control before destruction

      // DEMOLITION
      gameStateStub.turnOwner = gameStateStub.players[0].id;
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // no player lands exist
      player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(12);
      expect(gameStateStub.battlefield.lands['3-4'].controlledBy).toBe(player1.id); // still owned by player 1

      // player2 lands increased
      player2Lands = getPlayerLands(player2);
      expect(player2Lands.length).toBe(14); // not changed
    });
  });
});
