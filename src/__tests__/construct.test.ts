import { GameState } from '../state/GameState';
import { PlayerState } from '../state/PlayerState';
import { getLandId, LandPosition } from '../state/LandState';

import { BuildingType, getBuilding } from '../types/Building';
import { getLand, getLands } from '../map/utils/getLands';
import { getDefaultUnit, RegularUnitType } from '../types/Army';
import { relicts, TreasureItem } from '../types/Treasures';

import { construct } from '../map/building/construct';
import { placeUnitsOnMap } from './utils/placeUnitsOnMap';
import { createGameStateStub } from './utils/createGameStateStub';
import { getTilesInRadius } from '../map/utils/mapAlgorithms';

describe('Construct Buildings', () => {
  const homeLand1: LandPosition = { row: 3, col: 3 };
  const homeLand2: LandPosition = { row: 3, col: 8 };

  let gameStateStub: GameState;

  let player1: PlayerState;
  let player2: PlayerState;

  const getLandsInRadius = (mapPos: LandPosition) =>
    getTilesInRadius(gameStateStub.map.dimensions, mapPos, 1);

  beforeEach(() => {
    // clear map to remove all armies and buildings
    gameStateStub = createGameStateStub({ addPlayersHomeland: false });
    player1 = gameStateStub.allPlayers[0];
    player2 = gameStateStub.allPlayers[1];
    gameStateStub.allPlayers.forEach((player) => (player.vault = 200000));
  });

  const expectLands = (player: PlayerState, expectedLands: string[]) => {
    expect(player.nLands()).toBe(expectedLands.length);
    expectedLands.forEach((landId) => expect(player.hasLand(landId)).toBeTruthy());
  };

  describe('Constructing a building', () => {
    it('Build one Stronghold', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);

      expectLands(player1, getLandsInRadius(homeLand1).map(getLandId));
      expect(player2.nLands()).toBe(0);
    });

    it('Build two Strongholds for two players, no intersection', () => {
      expect(gameStateStub.turnOwner.id).toBe(player1.id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);
      gameStateStub.nextPlayer();
      expect(gameStateStub.turnOwner.id).toBe(player2.id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand2);

      expectLands(player1, getLandsInRadius(homeLand1).map(getLandId));
      expectLands(player2, getLandsInRadius(homeLand2).map(getLandId));
    });

    it('Build two Strongholds for two players, has intersection radius 1 no building on intersection', () => {
      expect(gameStateStub.turnOwner.id).toBe(player1.id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);
      expectLands(player1, getLandsInRadius(homeLand1).map(getLandId));

      gameStateStub.nextPlayer();
      expect(gameStateStub.turnOwner.id).toBe(player2.id);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 5 });
      expectLands(player1, getLandsInRadius(homeLand1).map(getLandId));

      expectLands(
        player2,
        getLandsInRadius({ row: 3, col: 5 })
          .map(getLandId)
          .filter((l) => l !== '3-4')
      );
    });

    it('Construction cost 15% less if player has TreasureItem.CROWN_OF_DOMINION', () => {
      expect(gameStateStub.turnOwner.id).toBe(player1.id);
      gameStateStub.turnOwner.empireTreasures.push(
        relicts.find((r) => r.id === TreasureItem.CROWN_OF_DOMINION)!
      );
      expect(gameStateStub.turnOwner.vault).toBe(200000);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);
      expect(gameStateStub.turnOwner.vault).toBe(
        200000 - Math.ceil(getBuilding(BuildingType.STRONGHOLD).buildCost * 0.85)
      );
    });
  });

  describe('Demolition building', () => {
    const strongholdPos: LandPosition = homeLand1;
    const buildingPos: LandPosition = { row: 3, col: 4 };

    it('Build one Stronghold and one Demolition', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      expect(gameStateStub.map.lands[getLandId(strongholdPos)].buildings.length).toBe(0);

      expect(player1.nLands()).toBe(0);
      expect(player2.nLands()).toBe(0);
    });

    it('Demolition non-stronghold', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);
      expect(player1.nLands()).toBe(7);

      construct(gameStateStub, BuildingType.DEMOLITION, buildingPos);

      // stronghold is not destroyed
      expect(getLand(gameStateStub, strongholdPos).buildings[0].id).toBe(BuildingType.STRONGHOLD);

      // barracks is destroyed
      expect(getLand(gameStateStub, buildingPos).buildings.length).toBe(0);

      // no player lands destroyed
      expectLands(player1, getLandsInRadius(strongholdPos).map(getLandId));
    });

    it('Demolition not destroy buildings on other lands', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold is destroyed
      expect(gameStateStub.map.lands[getLandId(strongholdPos)].buildings.length).toBe(0);

      // barracks is not destroyed
      expect(gameStateStub.map.lands[getLandId(buildingPos)].buildings[0].id).toBe(
        BuildingType.BARRACKS
      );

      // no player lands exist
      expect(player1.nLands()).toBe(0);
    });

    it('Demolition not change owner of the stronghold which is in radius 2 from destroyed stronghold', () => {
      const strongholdPos2: LandPosition = { row: 3, col: 5 };
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos2);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);

      expectLands(player1, [
        '2-3',
        '2-4',
        '2-5',
        '2-6',
        '3-2',
        '3-3',
        '3-4',
        '3-5',
        '3-6',
        '4-3',
        '4-4',
        '4-5',
        '4-6',
      ]);

      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold 1 is destroyed
      expect(getLand(gameStateStub, strongholdPos).buildings.length).toBe(0);
      // barracks and stronghold are not destroyed

      expect(getLand(gameStateStub, buildingPos).buildings[0].id).toBe(BuildingType.BARRACKS);
      expect(getLand(gameStateStub, strongholdPos2).buildings.length).toBe(1);

      expectLands(player1, getLandsInRadius(strongholdPos2).map(getLandId));
    });

    it('When stronghold destroyed lands with army not lost players control', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);

      placeUnitsOnMap(getDefaultUnit(RegularUnitType.WARRIOR), gameStateStub, buildingPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold is destroyed
      expect(gameStateStub.map.lands[getLandId(strongholdPos)].buildings.length).toBe(0);

      // the barracks is not destroyed
      expect(gameStateStub.map.lands[getLandId(buildingPos)].buildings[0].id).toBe(
        BuildingType.BARRACKS
      );
      // army is not lost
      expect(gameStateStub.map.lands[getLandId(buildingPos)].army.length).toBe(1);

      // only one land still under control (with army)
      expect(player1.nLands()).toBe(1);
      expect(player1.hasLand(getLandId(buildingPos))).toBeTruthy();
    });

    it('When stronghold destroyed land could change owner', () => {
      expect(gameStateStub.turnOwner).toBe(player1.id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);

      gameStateStub.nextPlayer();
      expect(gameStateStub.turnOwner).toBe(player2.id);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 5 });

      expectLands(player1, getLandsInRadius(homeLand1).map(getLandId));
      expectLands(
        player2,
        getLandsInRadius({ row: 3, col: 5 })
          .map(getLandId)
          .filter((l) => l !== '3-4')
      );

      // DEMOLITION
      while (gameStateStub.turnOwner.id !== player1.id) gameStateStub.nextPlayer();
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // no player lands exist
      expect(player1.nLands()).toBe(0);
      // player2 lands increased
      expectLands(player2, getLandsInRadius({ row: 3, col: 5 }).map(getLandId));

      expect(player2.hasLand('3-4')).toBeTruthy();
    });

    it('When stronghold destroyed land not change owner if another stronghold of the same owner is near', () => {
      expect(gameStateStub.turnOwner).toBe(player1.id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 2, col: 5 }); // stronghold of player 1 near destroyed land

      gameStateStub.nextPlayer();
      expect(gameStateStub.turnOwner).toBe(player2.id);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 4, col: 5 });

      expect(player1.nLands()).toBe(12);
      expect(player2.nLands()).toBe(4);

      expect(player1.hasLand('3-4')).toBeTruthy();
      expect(player1.hasLand('4-4')).toBeTruthy();

      // DEMOLITION
      while (gameStateStub.turnOwner.id !== player1.id) gameStateStub.nextPlayer();
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // player1 has only one stronghold left
      expectLands(player1, getLandsInRadius({ row: 2, col: 5 }).map(getLandId));
      expect(player1.hasLand('3-4')).toBeTruthy(); // still owned by player 1

      // player2 lands increased
      expect(player2.nLands()).toBe(5); // increased by 1 land
      expect(player2.hasLand('4-4')).toBeTruthy();
    });
  });

  describe('Corner cases', () => {
    it('Building should not constructed if not enough money in vault', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);

      const emptyLand = getLands({
        gameState: gameStateStub,
        players: [gameStateStub.turnOwner.id],
        buildings: [],
      })[0];
      gameStateStub.turnOwner.vault = 0; // vault is empty

      expect(emptyLand).toBeDefined();
      expect(emptyLand.buildings.length).toBe(0);

      construct(gameStateStub, BuildingType.BARRACKS, emptyLand.mapPos);
      expect(emptyLand.buildings.length).toBe(0); // not constructed
    });
  });
});
