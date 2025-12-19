import { getLandId } from '../state/map/land/LandId';
import { getLand, getTilesInRadius } from '../selectors/landSelectors';
import { getPlayer, getPlayerLands, getTurnOwner } from '../selectors/playerSelectors';
import { getBuildingInfo } from '../domain/building/buildingRepository';
import { addPlayerEmpireTreasure } from '../systems/gameStateActions';
import { getArmiesAtPosition } from '../selectors/armySelectors';
import { hasLand, nextPlayer } from '../systems/playerActions';
import { regularsFactory } from '../factories/regularsFactory';
import { relictFactory } from '../factories/treasureFactory';
import { construct } from '../map/building/construct';
import { PREDEFINED_PLAYERS } from '../domain/player/playerRepository';

import { BuildingType } from '../types/Building';
import { RegularUnitType } from '../types/UnitType';
import { TreasureType } from '../types/Treasures';
import type { GameState } from '../state/GameState';
import type { PlayerState } from '../state/player/PlayerState';
import type { LandPosition } from '../state/map/land/LandPosition';

import { placeUnitsOnMap } from './utils/placeUnitsOnMap';
import { createGameStateStub } from './utils/createGameStateStub';

describe('Construct Buildings', () => {
  const homeLand1: LandPosition = { row: 3, col: 3 };
  const homeLand2: LandPosition = { row: 3, col: 8 };

  let gameStateStub: GameState;

  const player1Id = PREDEFINED_PLAYERS[0].id;
  const player2Id = PREDEFINED_PLAYERS[1].id;

  const getLandsInRadius = (mapPos: LandPosition) =>
    getTilesInRadius(gameStateStub.map.dimensions, mapPos, 1);

  beforeEach(() => {
    // clear map to remove all armies and buildings
    gameStateStub = createGameStateStub({ addPlayersHomeland: false });
    gameStateStub.players.forEach((player) => (player.vault = 200000));
  });

  const expectLands = (player: PlayerState, expectedLands: LandPosition[]) => {
    expect(player.landsOwned.size).toBe(expectedLands.length);
    expectedLands.forEach((landId) => expect(hasLand(player, landId)).toBeTruthy());
  };

  describe('Constructing a building', () => {
    it('Build one Stronghold', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);

      expectLands(getPlayer(gameStateStub, player1Id), getLandsInRadius(homeLand1));
      expect(getPlayerLands(gameStateStub, player2Id)).toHaveLength(0);
    });

    it('Build two Strongholds for two players, no intersection', () => {
      expect(getTurnOwner(gameStateStub).id).toBe(player1Id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);
      nextPlayer(gameStateStub);
      expect(getTurnOwner(gameStateStub).id).toBe(player2Id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand2);

      expectLands(getPlayer(gameStateStub, player1Id), getLandsInRadius(homeLand1));
      expectLands(getPlayer(gameStateStub, player2Id), getLandsInRadius(homeLand2));
    });

    it('Build two Strongholds for two players, has intersection radius 1 no building on intersection', () => {
      expect(getTurnOwner(gameStateStub).id).toBe(player1Id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);
      expectLands(getPlayer(gameStateStub, player1Id), getLandsInRadius(homeLand1));

      nextPlayer(gameStateStub);
      expect(getTurnOwner(gameStateStub).id).toBe(player2Id);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 5 });
      expectLands(getPlayer(gameStateStub, player1Id), getLandsInRadius(homeLand1));

      expectLands(
        getPlayer(gameStateStub, player2Id),
        getLandsInRadius({ row: 3, col: 5 }).filter((l) => !(l.row === 3 && l.col === 4))
      );
    });

    it('Construction cost 15% less if player has TreasureItem.CROWN_OF_DOMINION', () => {
      while (gameStateStub.turn < 2) nextPlayer(gameStateStub);
      while (getTurnOwner(gameStateStub).id !== player1Id) nextPlayer(gameStateStub);

      Object.assign(
        gameStateStub,
        addPlayerEmpireTreasure(
          gameStateStub,
          player1Id,
          relictFactory(TreasureType.CROWN_OF_DOMINION)
        )
      );

      expect(getTurnOwner(gameStateStub).vault).toBe(200000);

      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);
      expect(getTurnOwner(gameStateStub).vault).toBe(
        200000 - Math.ceil(getBuildingInfo(BuildingType.STRONGHOLD).buildCost * 0.85)
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

      expect(getPlayerLands(gameStateStub, player1Id)).toHaveLength(0);
      expect(getPlayerLands(gameStateStub, player2Id)).toHaveLength(0);
    });

    it('Demolition non-stronghold', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);
      expect(getPlayerLands(gameStateStub, player1Id)).toHaveLength(7);

      construct(gameStateStub, BuildingType.DEMOLITION, buildingPos);

      // stronghold is not destroyed
      expect(getLand(gameStateStub, strongholdPos).buildings[0].id).toBe(BuildingType.STRONGHOLD);

      // barracks is destroyed
      expect(getLand(gameStateStub, buildingPos).buildings.length).toBe(0);

      // no player lands destroyed
      expectLands(getPlayer(gameStateStub, player1Id), getLandsInRadius(strongholdPos));
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
      expect(getPlayerLands(gameStateStub, player1Id)).toHaveLength(0);
    });

    it('Demolition not change owner of the stronghold which is in radius 2 from destroyed stronghold', () => {
      const strongholdPos2: LandPosition = { row: 3, col: 5 };
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos2);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);

      expectLands(getPlayer(gameStateStub, player1Id), [
        { row: 2, col: 3 },
        { row: 2, col: 4 },
        { row: 2, col: 5 },
        { row: 2, col: 6 },
        { row: 3, col: 2 },
        { row: 3, col: 3 },
        { row: 3, col: 4 },
        { row: 3, col: 5 },
        { row: 3, col: 6 },
        { row: 4, col: 3 },
        { row: 4, col: 4 },
        { row: 4, col: 5 },
        { row: 4, col: 6 },
      ]);

      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold 1 is destroyed
      expect(getLand(gameStateStub, strongholdPos).buildings.length).toBe(0);
      // barracks and stronghold are not destroyed

      expect(getLand(gameStateStub, buildingPos).buildings[0].id).toBe(BuildingType.BARRACKS);
      expect(getLand(gameStateStub, strongholdPos2).buildings.length).toBe(1);

      expectLands(getPlayer(gameStateStub, player1Id), getLandsInRadius(strongholdPos2));
    });

    it('When stronghold destroyed lands with army not lost players control', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, strongholdPos);
      construct(gameStateStub, BuildingType.BARRACKS, buildingPos);

      placeUnitsOnMap(regularsFactory(RegularUnitType.WARRIOR), gameStateStub, buildingPos);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // stronghold is destroyed
      expect(getLand(gameStateStub, strongholdPos).buildings.length).toBe(0);

      // the barracks is not destroyed
      expect(getLand(gameStateStub, buildingPos).buildings[0].id).toBe(BuildingType.BARRACKS);
      // army is not lost
      const armies = getArmiesAtPosition(gameStateStub, buildingPos);
      expect(armies.length).toBe(1);

      // only one land still under control (with army)
      expect(getPlayerLands(gameStateStub, player1Id)).toHaveLength(1);
      expect(hasLand(getPlayer(gameStateStub, player1Id), buildingPos)).toBeTruthy();
    });

    it('When stronghold destroyed land could change owner', () => {
      expect(getTurnOwner(gameStateStub).id).toBe(player1Id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);

      nextPlayer(gameStateStub);
      expect(getTurnOwner(gameStateStub).id).toBe(player2Id);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 3, col: 5 });

      expectLands(getPlayer(gameStateStub, player1Id), getLandsInRadius(homeLand1));
      expectLands(
        getPlayer(gameStateStub, player2Id),
        getLandsInRadius({ row: 3, col: 5 }).filter((l) => !(l.row === 3 && l.col === 4))
      );

      // DEMOLITION
      while (getTurnOwner(gameStateStub).id !== player1Id) nextPlayer(gameStateStub);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // no player lands exist
      expect(getPlayerLands(gameStateStub, player1Id)).toHaveLength(0);
      // player2 lands increased
      expectLands(getPlayer(gameStateStub, player2Id), getLandsInRadius({ row: 3, col: 5 }));

      expect(hasLand(getPlayer(gameStateStub, player2Id), { row: 3, col: 4 })).toBeTruthy();
    });

    it('When stronghold destroyed land not change owner if another stronghold of the same owner is near', () => {
      expect(getTurnOwner(gameStateStub).id).toBe(player1Id);
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 2, col: 5 }); // stronghold of player 1 near destroyed land

      nextPlayer(gameStateStub);
      expect(getTurnOwner(gameStateStub).id).toBe(player2Id);
      construct(gameStateStub, BuildingType.STRONGHOLD, { row: 4, col: 5 });

      expect(getPlayerLands(gameStateStub, player1Id)).toHaveLength(12);
      expect(getPlayerLands(gameStateStub, player2Id)).toHaveLength(4);

      expect(hasLand(getPlayer(gameStateStub, player1Id), { row: 3, col: 4 })).toBeTruthy();
      expect(hasLand(getPlayer(gameStateStub, player1Id), { row: 4, col: 4 })).toBeTruthy();

      // DEMOLITION
      while (getTurnOwner(gameStateStub).id !== player1Id) nextPlayer(gameStateStub);
      construct(gameStateStub, BuildingType.DEMOLITION, strongholdPos);

      // player1 has only one stronghold left
      expectLands(getPlayer(gameStateStub, player1Id), getLandsInRadius({ row: 2, col: 5 }));
      expect(hasLand(getPlayer(gameStateStub, player1Id), { row: 3, col: 4 })).toBeTruthy(); // still owned by player 1

      // player2 lands increased
      expect(getPlayer(gameStateStub, player2Id).landsOwned.size).toBe(5); // increased by 1 land
      expect(hasLand(getPlayer(gameStateStub, player2Id), { row: 4, col: 4 })).toBeTruthy();
    });
  });

  describe('Corner cases', () => {
    it('Building should not constructed if not enough money in vault', () => {
      construct(gameStateStub, BuildingType.STRONGHOLD, homeLand1);

      const emptyLand = getPlayerLands(gameStateStub).filter((l) => l.buildings.length === 0)[0];
      getTurnOwner(gameStateStub).vault = 0; // vault is empty

      while (gameStateStub.turn < 2) nextPlayer(gameStateStub);

      expect(emptyLand).toBeDefined();
      expect(emptyLand.buildings.length).toBe(0);

      construct(gameStateStub, BuildingType.BARRACKS, emptyLand.mapPos);
      expect(emptyLand.buildings.length).toBe(0); // not constructed
    });
  });
});
