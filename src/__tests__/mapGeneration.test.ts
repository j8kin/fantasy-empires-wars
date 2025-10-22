import { generateMap } from '../map/generation/generateMap';
import { addPlayerToMap } from '../map/generation/addPlayerToMap';
import { LAND_TYPE } from '../types/Land';
import { BuildingType, getBuilding } from '../types/Building';
import { NO_PLAYER, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { battlefieldLandId } from '../types/GameState';
import { calculateHexDistance } from '../map/utils/mapAlgorithms';
import { Alignment } from '../types/Alignment';
import { toGamePlayer } from './utils/toGamePlayer';
import { createGameStateStub } from './utils/createGameStateStub';
import { getLands } from '../map/utils/mapLands';

describe('Map Generation with Players', () => {
  describe('Basic Map Generation Without Players', () => {
    it('should generate map without players when no players provided', () => {
      const dimensions = { rows: 9, cols: 18 };
      const tiles = generateMap(dimensions);

      // Should generate tiles
      expect(Object.keys(tiles).length).toBeGreaterThan(0);

      // All tiles should be controlled by a neutral player
      Object.values(tiles.lands).forEach((tile) => {
        expect(tile.controlledBy).toBe(NO_PLAYER.id);
      });

      // Should have volcano and lava tiles
      const volcanoTiles = Object.values(tiles.lands).filter(
        (tile) => tile.land.id === LAND_TYPE.VOLCANO
      );
      const lavaTiles = Object.values(tiles.lands).filter(
        (tile) => tile.land.id === LAND_TYPE.LAVA
      );

      expect(volcanoTiles.length).toBe(1);
      expect(lavaTiles.length).toBeGreaterThan(0);
    });
  });

  describe('Player Positioning', () => {
    it('should assign necromancer to volcano land', () => {
      const gameStateStub = createGameStateStub({
        turnOwner: 1,
        realBattlefield: true, // Use generateMap to create real battlefield
        addPlayersHomeland: false,
      });
      const necromancerPlayer = gameStateStub.players[1]; // Undead necromancer
      addPlayerToMap(gameStateStub);

      // Find volcano tile
      const volcanoTiles = getLands(gameStateStub.battlefield.lands, undefined, LAND_TYPE.VOLCANO);
      expect(volcanoTiles.length).toBe(1);

      const volcanoTile = volcanoTiles[0];
      expect(volcanoTile.controlledBy).toBe(necromancerPlayer.id);
    });

    it('should assign stronghold building to player homelands and add Players Hero', () => {
      const gameStateStub = createGameStateStub({
        turnOwner: 1,
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false,
      });
      addPlayerToMap(gameStateStub); // SUT

      // Find player-owned tiles
      const playerTiles = Object.values(gameStateStub.battlefield.lands).filter(
        (tile) => tile.controlledBy !== NO_PLAYER.id
      );

      expect(playerTiles.length).toBeGreaterThan(0);

      // Find strongholds
      const strongholdTiles = Object.values(gameStateStub.battlefield.lands).filter((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTiles.length).toBe(gameStateStub.players.length);

      // Each stronghold should be on a player's homeland
      strongholdTiles.forEach((strongholdTile) => {
        expect(strongholdTile.controlledBy).not.toBe(NO_PLAYER.id);
        expect(strongholdTile.buildings).toEqual([getBuilding(BuildingType.STRONGHOLD)]);

        // verify that a Players hero added and placed in Homeland
        expect(strongholdTile.army.length).toEqual(1);
        expect(strongholdTile.army[0].unit.name).toEqual(
          gameStateStub.players.find((p) => p.id === strongholdTile.controlledBy)?.name
        );
        expect(strongholdTile.army[0].unit.hero).toBeTruthy();
        expect(strongholdTile.army[0].unit.level).toEqual(
          gameStateStub.players.find((p) => p.id === strongholdTile.controlledBy)?.level
        );
      });
    });

    it('should assign lands based on player alignment', () => {
      const gameStateStub = createGameStateStub({
        battlefieldSize: { rows: 6, cols: 13 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false,
      });

      addPlayerToMap(gameStateStub); // SUT

      const playersTiles = Object.values(gameStateStub.battlefield.lands).filter(
        (tile) => tile.controlledBy !== NO_PLAYER.id
      );

      expect(playersTiles.length).toBeGreaterThan(0);

      // Check if the homeland (stronghold tile) has appropriate alignment or is a volcano for necromancer
      const strongholdTile = playersTiles.filter((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTile).toBeDefined();
      expect(strongholdTile.length).toBe(gameStateStub.players.length);

      // For any player it should be either players.alignment or neutral
      strongholdTile!.forEach((tile) => {
        const testPlayer = gameStateStub.players.find((p) => p.id === tile.controlledBy);
        expect(testPlayer).toBeDefined();
        expect(
          tile.land.alignment === testPlayer?.alignment || tile.land.alignment === Alignment.NEUTRAL
        ).toBeTruthy();
      });
    });

    it('should maintain player distance constraints', () => {
      const gameStateStub = createGameStateStub({
        battlefieldSize: { rows: 11, cols: 23 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false,
      });

      addPlayerToMap(gameStateStub); // SUT

      // Find stronghold positions (homelands)
      const strongholdTiles = Object.values(gameStateStub.battlefield.lands).filter((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTiles.length).toBe(gameStateStub.players.length);
      expect(
        calculateHexDistance(
          gameStateStub.battlefield.dimensions,
          strongholdTiles[0].mapPos,
          strongholdTiles[1].mapPos
        )
      ).toBeGreaterThanOrEqual(3);
      expect(
        calculateHexDistance(
          gameStateStub.battlefield.dimensions,
          strongholdTiles[0].mapPos,
          strongholdTiles[2].mapPos
        )
      ).toBeGreaterThanOrEqual(3);
      expect(
        calculateHexDistance(
          gameStateStub.battlefield.dimensions,
          strongholdTiles[1].mapPos,
          strongholdTiles[2].mapPos
        )
      ).toBeGreaterThanOrEqual(3);
    });

    it('should assign lands within radius 2 of strongholds', () => {
      const gameStateStub = createGameStateStub({
        nPlayers: 1,
        battlefieldSize: { rows: 9, cols: 18 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false,
      });
      expect(gameStateStub.players.length).toBe(1); // double check that one player is added

      addPlayerToMap(gameStateStub); // SUT

      const strongholdTile = Object.values(gameStateStub.battlefield.lands).find((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTile).toBeDefined();

      const playerTiles = Object.values(gameStateStub.battlefield.lands).filter(
        (tile) => tile.controlledBy === gameStateStub.players[0].id
      );

      // All player tiles should be within radius 2 of the stronghold
      playerTiles.forEach((tile) => {
        expect(
          calculateHexDistance(
            gameStateStub.battlefield.dimensions,
            strongholdTile!.mapPos,
            tile.mapPos
          )
        ).toBeLessThanOrEqual(2);
      });

      // Should have multiple tiles (stronghold plus surrounding)
      expect(playerTiles.length).toBeGreaterThan(1);
    });

    it('should handle conflicts where multiple players could own same land', () => {
      const gameStateStub = createGameStateStub({
        battlefieldSize: { rows: 6, cols: 13 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false,
      });
      addPlayerToMap(gameStateStub); // SUT

      const player1Tiles = Object.values(gameStateStub.battlefield.lands).filter(
        (tile) => tile.controlledBy === PREDEFINED_PLAYERS[0].id
      );
      const player2Tiles = Object.values(gameStateStub.battlefield.lands).filter(
        (tile) => tile.controlledBy === PREDEFINED_PLAYERS[1].id
      );

      expect(player1Tiles.length).toBeGreaterThan(0);
      expect(player2Tiles.length).toBeGreaterThan(0);

      // No tile should be owned by multiple players
      const player1TilesIds = player1Tiles.map((tile) => battlefieldLandId(tile.mapPos));
      const player2TilesIds = player2Tiles.map((tile) => battlefieldLandId(tile.mapPos));
      expect(player1TilesIds.every((id) => !player2TilesIds.includes(id))).toBeTruthy();
    });
  });

  describe('Integration with Predefined Players', () => {
    it('should work with predefined players from GamePlayer', () => {
      const gameStateStub = createGameStateStub({
        nPlayers: 4,
        battlefieldSize: { rows: 11, cols: 23 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false,
      });
      expect(gameStateStub.players.length).toBe(4);

      addPlayerToMap(gameStateStub); // SUT

      // Should assign all players
      const assignedPlayerIds = new Set();
      Object.values(gameStateStub.battlefield.lands).forEach((tile) => {
        if (tile.controlledBy !== NO_PLAYER.id) {
          assignedPlayerIds.add(tile.controlledBy);
        }
      });

      expect(assignedPlayerIds.size).toBe(gameStateStub.players.length);

      // Check that necromancer players got volcano
      const volcanoTiles = Object.values(gameStateStub.battlefield.lands).filter(
        (tile) => tile.land.id === LAND_TYPE.VOLCANO
      );
      expect(volcanoTiles.length).toBe(1);

      const volcanoOwner = volcanoTiles[0].controlledBy;
      const volcanoOwnerPlayer = gameStateStub.players.find((p) => p.id === volcanoOwner);
      expect(volcanoOwnerPlayer?.race).toBe('Undead');
    });

    it('should handle multiple necromancers competing for volcano', () => {
      const gameStateStub = createGameStateStub({
        nPlayers: 1,
        battlefieldSize: { rows: 9, cols: 18 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false,
      });

      const necromancers = PREDEFINED_PLAYERS.filter((p) => p.race === 'Undead')
        .slice(0, 2)
        .map((p) => toGamePlayer(p));

      gameStateStub.players = necromancers;
      gameStateStub.turnOwner = necromancers[0].id;

      addPlayerToMap(gameStateStub); // SUT

      // Only one can own the volcano
      const volcanoTiles = Object.values(gameStateStub.battlefield.lands).filter(
        (tile) => tile.land.id === LAND_TYPE.VOLCANO
      );
      expect(volcanoTiles.length).toBe(1);

      const volcanoOwner = volcanoTiles[0].controlledBy;
      expect(necromancers.some((n) => n.id === volcanoOwner)).toBe(true);

      // The other necromancer should still be assigned somewhere
      const assignedPlayerIds = new Set();
      Object.values(gameStateStub.battlefield.lands).forEach((tile) => {
        if (tile.controlledBy !== NO_PLAYER.id) {
          assignedPlayerIds.add(tile.controlledBy);
        }
      });

      expect(assignedPlayerIds.size).toBe(necromancers.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty player array gracefully', () => {
      const gameStateStub = createGameStateStub({
        battlefieldSize: { rows: 9, cols: 18 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false, // do not place players and homelands
      });

      Object.values(gameStateStub.battlefield.lands).forEach((tile) => {
        expect(tile.controlledBy).toBe(NO_PLAYER.id);
        expect(tile.buildings.length).toBe(0);
      });
    });

    it('should handle single player', () => {
      const gameStateStub = createGameStateStub({
        nPlayers: 1,
        battlefieldSize: { rows: 9, cols: 18 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false, // do not place players and homelands
      });
      expect(gameStateStub.players.length).toBe(1);

      addPlayerToMap(gameStateStub); // SUT

      const playerTiles = Object.values(gameStateStub.battlefield.lands).filter(
        (tile) => tile.controlledBy === gameStateStub.players[0].id
      );

      expect(playerTiles.length).toBeGreaterThan(0);

      const strongholdTiles = Object.values(gameStateStub.battlefield.lands).filter((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTiles.length).toBe(1);
    });

    it('should maintain map integrity after player assignment', () => {
      const gameStateStub = createGameStateStub({
        battlefieldSize: { rows: 9, cols: 18 },
        realBattlefield: true, // Use generateMap to create a real battlefield
        addPlayersHomeland: false, // do not place players and homelands
      });

      addPlayerToMap(gameStateStub);

      // Check all expected tiles exist
      for (let row = 0; row < gameStateStub.battlefield.dimensions.rows; row++) {
        const colsInRow =
          row % 2 === 0
            ? gameStateStub.battlefield.dimensions.cols
            : gameStateStub.battlefield.dimensions.cols - 1;
        for (let col = 0; col < colsInRow; col++) {
          const tileId = battlefieldLandId({ row: row, col: col });
          expect(gameStateStub.battlefield.lands[tileId]).toBeDefined();
          expect(gameStateStub.battlefield.lands[tileId].mapPos.row).toBe(row);
          expect(gameStateStub.battlefield.lands[tileId].mapPos.col).toBe(col);
        }
      }

      // Check no invalid land types
      Object.values(gameStateStub.battlefield.lands).forEach((tile) => {
        expect(tile.land.id).not.toBe(LAND_TYPE.NONE);
      });
    });
  });
});
