import { getLandId, getTurnOwner } from '../types/GameState';
import { generateMockMap } from './utils/generateMockMap';
import { construct } from '../map/building/construct';
import { BuildingType, getBuilding } from '../types/Building';
import { getLand, getLands, LandPosition } from '../map/utils/getLands';
import { placeUnitsOnMap } from './utils/placeUnitsOnMap';
import { getDefaultUnit, RegularUnitType } from '../types/Army';
import {
  createDefaultGameStateStub,
  defaultBattlefieldSizeStub,
} from './utils/createGameStateStub';
import { PlayerState } from '../types/PlayerState';
import { relicts, TreasureItem } from '../types/Treasures';

describe('Construct Buildings', () => {
  let gameStateStub = createDefaultGameStateStub();

  const player1 = gameStateStub.players[0];
  const player2 = gameStateStub.players[1];

  const getPlayerLands = (player: PlayerState) =>
    getLands({
      gameState: gameStateStub,
      players: [player.playerId],
    }).map((land) => getLandId(land.mapPos));

  beforeEach(() => {
    // clear map to remove all armies and buildings
    gameStateStub.battlefield = generateMockMap(defaultBattlefieldSizeStub);
    gameStateStub.turnOwner = gameStateStub.players[0].playerId;
    gameStateStub.players.forEach((player) => (player.vault = 200000));
  });

  describe('Constructing a building', () => {
    it('Build one Stronghold', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      const player1Lands = getPlayerLands(player1);

      // row 1
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      // row 2
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      // row 3
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');

      // no other lands should be in the player's land's
      expect(player1Lands.length).toBe(7);
    });

    it('Build two Strongholds for two players, no intersection', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].playerId;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      gameStateStub.turnOwner = gameStateStub.players[1].playerId;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 8 });

      const player1Lands = getLands({
        gameState: gameStateStub,
        players: [player1.playerId],
      }).map((land) => getLandId(land.mapPos));
      // row 1
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      // row 2
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      // row 3
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      // no other lands should be in the player's land's

      expect(player1Lands.length).toBe(7);

      const player2Lands = getPlayerLands(player2);
      // row 1
      expect(player2Lands).toContain('2-8');
      expect(player2Lands).toContain('2-9');
      // row 2
      expect(player2Lands).toContain('3-7');
      expect(player2Lands).toContain('3-8');
      expect(player2Lands).toContain('3-9');
      // row 3
      expect(player2Lands).toContain('4-8');
      expect(player2Lands).toContain('4-9');

      // no other lands should be in the player's land's
      expect(player2Lands.length).toBe(7);
    });

    it('Build two Strongholds for two players, has intersection radius 1 no building on intersection', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].playerId;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      gameStateStub.turnOwner = gameStateStub.players[1].playerId;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 5 });

      const player1Lands = getPlayerLands(player1);
      // row 1
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      // row 2
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      // row 3
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');

      //no other lands should be in the player's land's
      expect(player1Lands.length).toBe(7);

      const player2Lands = getPlayerLands(player2);
      // row 1
      expect(player2Lands).toContain('2-5');
      expect(player2Lands).toContain('2-6');
      // row 2
      expect(player2Lands).toContain('3-5');
      expect(player2Lands).toContain('3-6');
      // row 3
      expect(player2Lands).toContain('4-5');
      expect(player2Lands).toContain('4-6');

      // no other lands should be in the player's land's
      expect(player2Lands.length).toBe(6);
    });

    it('Construction cost 15% less if player has TreasureItem.CROWN_OF_DOMINION', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].playerId;
      gameStateStub.players[0].empireTreasures.push(
        relicts.find((r) => r.id === TreasureItem.CROWN_OF_DOMINION)!
      );
      expect(gameStateStub.players[0].vault).toBe(200000);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      expect(gameStateStub.players[0].vault).toBe(
        200000 - Math.ceil(getBuilding(BuildingType.STRONGHOLD).buildCost * 0.85)
      );
    });
  });

  describe('Demolition building', () => {
    const strongholdPos: LandPosition = { row: 3, col: 3 };
    const buildingPos: LandPosition = { row: 3, col: 4 };

    it('Build one Stronghold and one Demolition', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      expect(gameStateStub.battlefield.lands[getLandId(strongholdPos)].buildings.length).toBe(0);

      const player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(0);
    });

    it('Demolition non-stronghold', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);
      expect(getPlayerLands(player1).length).toBe(7);

      construct(gameStateStub, BuildingType.DEMOLITION, buildingPos);

      // stronghold is not destroyed
      expect(getLand(gameStateStub, strongholdPos).buildings[0].id).toBe(BuildingType.STRONGHOLD);

      // barracks is destroyed
      expect(getLand(gameStateStub, buildingPos).buildings.length).toBe(0);

      // no player lands destroyed
      expect(getPlayerLands(player1).length).toBe(7);
    });

    it('Demolition not destroy buildings on other lands', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold is destroyed
      expect(gameStateStub.battlefield.lands[getLandId(strongholdPos)].buildings.length).toBe(0);

      // barracks is not destroyed
      expect(gameStateStub.battlefield.lands[getLandId(buildingPos)].buildings[0].id).toBe(
        BuildingType.BARRACKS
      );

      // no player lands exist
      const player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(0);
    });

    it('Demolition not change owner of the stronghold which is in radius 2 from destroyed stronghold', () => {
      const strongholdPos2: LandPosition = { row: 3, col: 5 };
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos2);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);

      const player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(13);
      // row 1
      expect(player1Lands).toContain('2-3');
      expect(player1Lands).toContain('2-4');
      expect(player1Lands).toContain('2-5');
      expect(player1Lands).toContain('2-6');
      // row 2
      expect(player1Lands).toContain('3-2');
      expect(player1Lands).toContain('3-3');
      expect(player1Lands).toContain('3-4');
      expect(player1Lands).toContain('3-5');
      expect(player1Lands).toContain('3-6');
      // row 3
      expect(player1Lands).toContain('4-3');
      expect(player1Lands).toContain('4-4');
      expect(player1Lands).toContain('4-5');
      expect(player1Lands).toContain('4-6');

      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold 1 is destroyed
      expect(getLand(gameStateStub, strongholdPos).buildings.length).toBe(0);
      // barracks and stronghold are not destroyed

      expect(getLand(gameStateStub, buildingPos).buildings[0].id).toBe(BuildingType.BARRACKS);
      expect(getLand(gameStateStub, strongholdPos2).buildings.length).toBe(1);
      const stronghold2Land = getLand(gameStateStub, strongholdPos2);
      expect(stronghold2Land.controlledBy).toBe(player1.playerId);

      const player1LandsRemain = getPlayerLands(player1);

      // row 1
      expect(player1LandsRemain).toContain('2-5');
      expect(player1LandsRemain).toContain('2-6');
      // row 2
      expect(player1LandsRemain).toContain('3-4');
      expect(player1LandsRemain).toContain('3-5');
      expect(player1LandsRemain).toContain('3-6');
      // row 3
      expect(player1LandsRemain).toContain('4-5');
      expect(player1LandsRemain).toContain('4-6');

      expect(getPlayerLands(player1).length).toBe(7); // all lands related to player 1
    });

    it('When stronghold destroyed lands with army not lost players control', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);

      gameStateStub.turn = 2; // only on turn 2 and after units could be recruited in BARRACK and placed on map
      placeUnitsOnMap(getDefaultUnit(RegularUnitType.WARRIOR), gameStateStub, buildingPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold is destroyed
      expect(gameStateStub.battlefield.lands[getLandId(strongholdPos)].buildings.length).toBe(0);

      // barracks is not destroyed
      expect(gameStateStub.battlefield.lands[getLandId(buildingPos)].buildings[0].id).toBe(
        BuildingType.BARRACKS
      );
      // army is not lost
      expect(gameStateStub.battlefield.lands[getLandId(buildingPos)].army.length).toBe(1);

      // no player lands exist
      const player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(1);
      expect(player1Lands[0]).toBe(getLandId(buildingPos));
    });

    it('When stronghold destroyed land could change owner', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].playerId;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      gameStateStub.turnOwner = gameStateStub.players[1].playerId;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 5 });

      let player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(7);
      let player2Lands = getPlayerLands(player2);
      expect(player2Lands.length).toBe(6);
      expect(gameStateStub.battlefield.lands['3-4'].controlledBy).toBe(player1.playerId);

      // DEMOLITION
      gameStateStub.turnOwner = gameStateStub.players[0].playerId;
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // no player lands exist
      player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(0);
      // player2 lands increased
      player2Lands = getPlayerLands(player2);
      expect(player2Lands.length).toBe(7);

      expect(gameStateStub.battlefield.lands['3-4'].controlledBy).toBe(player2.playerId); // now controlled by player 2
    });

    it('When stronghold destroyed land not change owner if another stronghold of the same owner is near', () => {
      gameStateStub.turnOwner = gameStateStub.players[0].playerId;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 2, col: 5 }); // stronghold of player 1 near destroyed land
      gameStateStub.turnOwner = gameStateStub.players[1].playerId;
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 4, col: 5 });

      let player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(12);
      let player2Lands = getPlayerLands(player2);
      expect(player2Lands.length).toBe(4);

      expect(gameStateStub.battlefield.lands['3-4'].controlledBy).toBe(player1.playerId); // under player 1 control before destruction
      expect(gameStateStub.battlefield.lands['4-4'].controlledBy).toBe(player1.playerId); // under player 1 control before destruction

      // DEMOLITION
      gameStateStub.turnOwner = gameStateStub.players[0].playerId;
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // no player lands exist
      player1Lands = getPlayerLands(player1);
      expect(player1Lands.length).toBe(7);
      expect(gameStateStub.battlefield.lands['3-4'].controlledBy).toBe(player1.playerId); // still owned by player 1
      // player2 lands increased

      player2Lands = getPlayerLands(player2);
      expect(player2Lands.length).toBe(5); // not changed
      expect(gameStateStub.battlefield.lands['4-4'].controlledBy).toBe(player2.playerId); // change owner
    });
  });

  describe('Corner cases', () => {
    it('Building should not constructed if not enough money in vault', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 3 });

      const emptyLand = getLands({
        gameState: gameStateStub,
        players: [gameStateStub.turnOwner],
        buildings: [],
      })[0];
      getTurnOwner(gameStateStub)!.vault = 0; // vault is empty

      expect(emptyLand).toBeDefined();
      expect(emptyLand.buildings.length).toBe(0);
      construct(gameStateStub, BuildingType.BARRACKS, emptyLand.mapPos);
      expect(emptyLand.buildings.length).toBe(0);
    });
  });
});
