import { generateMap } from '../map/generation/generateMap';
import { addPlayerToMap } from '../map/generation/addPlayerToMap';
import { LAND_TYPE } from '../types/Land';
import { BuildingType, getBuilding } from '../types/Building';
import { NO_PLAYER, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { battlefieldLandId, GameState, getSelectedPlayer } from '../types/GameState';
import { calculateHexDistance } from '../map/utils/mapAlgorithms';
import { Alignment } from '../types/Alignment';
import { toGamePlayer } from './utils/toGamePlayer';

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
      const necromancerPlayer = toGamePlayer(PREDEFINED_PLAYERS[1]); // Undead necromancer
      const mockGameState: GameState = {
        battlefield: generateMap({ rows: 9, cols: 18 }),
        turn: 0,
        activePlayerId: necromancerPlayer.id,
        players: [necromancerPlayer],
      };
      addPlayerToMap(mockGameState);

      // Find volcano tile
      const volcanoTiles = Object.values(mockGameState.battlefield.lands).filter(
        (tile) => tile.land.id === LAND_TYPE.VOLCANO
      );
      expect(volcanoTiles.length).toBe(1);

      const volcanoTile = volcanoTiles[0];
      expect(volcanoTile.controlledBy).toBe(necromancerPlayer.id);
    });

    it('should assign stronghold building to player homelands and add Players Hero', () => {
      const testPlayers = PREDEFINED_PLAYERS.slice(0, 3).map(toGamePlayer);

      const mockGameState: GameState = {
        battlefield: generateMap({ rows: 9, cols: 18 }),
        turn: 0,
        activePlayerId: testPlayers[0].id,
        players: [testPlayers[0], testPlayers[1], testPlayers[2]],
      };
      addPlayerToMap(mockGameState);

      // Find player-owned tiles
      const playerTiles = Object.values(mockGameState.battlefield.lands).filter(
        (tile) => tile.controlledBy !== NO_PLAYER.id
      );

      expect(playerTiles.length).toBeGreaterThan(0);

      // Find strongholds
      const strongholdTiles = Object.values(mockGameState.battlefield.lands).filter((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTiles.length).toBe(testPlayers.length);

      // Each stronghold should be on a player's homeland
      strongholdTiles.forEach((strongholdTile) => {
        expect(strongholdTile.controlledBy).not.toBe(NO_PLAYER.id);
        expect(strongholdTile.buildings).toEqual([getBuilding(BuildingType.STRONGHOLD)]);

        // verify that a Players hero added and placed in Homeland
        expect(strongholdTile.army.length).toEqual(1);
        expect(strongholdTile.army[0].unit.name).toEqual(
          testPlayers.find((p) => p.id === strongholdTile.controlledBy)?.name
        );
        expect(strongholdTile.army[0].unit.hero).toBeTruthy();
        expect(strongholdTile.army[0].unit.level).toEqual(
          testPlayers.find((p) => p.id === strongholdTile.controlledBy)?.level
        );
      });
    });

    it('should assign lands based on player alignment', () => {
      const testPlayers = PREDEFINED_PLAYERS.slice(0, 3).map(toGamePlayer);
      const mockGameState: GameState = {
        battlefield: generateMap({ rows: 6, cols: 13 }),
        turn: 0,
        activePlayerId: testPlayers[0].id,
        players: [testPlayers[0], testPlayers[1], testPlayers[2]],
      };
      addPlayerToMap(mockGameState);

      const playersTiles = Object.values(mockGameState.battlefield.lands).filter(
        (tile) => tile.controlledBy !== NO_PLAYER.id
      );

      expect(playersTiles.length).toBeGreaterThan(0);

      // Check if the homeland (stronghold tile) has appropriate alignment or is a volcano for necromancer
      const strongholdTile = playersTiles.filter((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTile).toBeDefined();
      expect(strongholdTile.length).toBe(testPlayers.length);

      // For any player it should be either players.alignment or neutral
      strongholdTile!.forEach((tile) => {
        const testPlayer = testPlayers.find((p) => p.id === tile.controlledBy);
        expect(testPlayer).toBeDefined();
        expect(
          tile.land.alignment === testPlayer?.alignment || tile.land.alignment === Alignment.NEUTRAL
        ).toBeTruthy();
      });
    });

    it('should maintain player distance constraints', () => {
      const dimensions = { rows: 11, cols: 23 };
      const testPlayers = PREDEFINED_PLAYERS.slice(0, 3).map(toGamePlayer);
      const mockGameState: GameState = {
        battlefield: generateMap(dimensions),
        turn: 0,
        activePlayerId: testPlayers[0].id,
        players: [testPlayers[0], testPlayers[1], testPlayers[2]],
      };
      addPlayerToMap(mockGameState);

      // Find stronghold positions (homelands)
      const strongholdTiles = Object.values(mockGameState.battlefield.lands).filter((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTiles.length).toBe(testPlayers.length);
      expect(
        calculateHexDistance(dimensions, strongholdTiles[0].mapPos, strongholdTiles[1].mapPos)
      ).toBeGreaterThanOrEqual(3);
      expect(
        calculateHexDistance(dimensions, strongholdTiles[0].mapPos, strongholdTiles[2].mapPos)
      ).toBeGreaterThanOrEqual(3);
      expect(
        calculateHexDistance(dimensions, strongholdTiles[1].mapPos, strongholdTiles[2].mapPos)
      ).toBeGreaterThanOrEqual(3);
    });

    it('should assign lands within radius 2 of strongholds', () => {
      const dimensions = { rows: 9, cols: 18 };
      const singlePlayer = [toGamePlayer(PREDEFINED_PLAYERS[0])];
      const mockGameState: GameState = {
        battlefield: generateMap(dimensions),
        turn: 0,
        activePlayerId: singlePlayer[0].id,
        players: [singlePlayer[0]],
      };
      addPlayerToMap(mockGameState);

      const strongholdTile = Object.values(mockGameState.battlefield.lands).find((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTile).toBeDefined();

      const playerTiles = Object.values(mockGameState.battlefield.lands).filter(
        (tile) => tile.controlledBy === singlePlayer[0].id
      );

      // All player tiles should be within radius 2 of the stronghold
      playerTiles.forEach((tile) => {
        expect(
          calculateHexDistance(dimensions, strongholdTile!.mapPos, tile.mapPos)
        ).toBeLessThanOrEqual(2);
      });

      // Should have multiple tiles (stronghold plus surrounding)
      expect(playerTiles.length).toBeGreaterThan(1);
    });

    it('should handle conflicts where multiple players could own same land', () => {
      const mockGameState: GameState = {
        battlefield: generateMap({ rows: 6, cols: 13 }),
        turn: 0,
        activePlayerId: toGamePlayer(PREDEFINED_PLAYERS[0]).id,
        players: [toGamePlayer(PREDEFINED_PLAYERS[0]), toGamePlayer(PREDEFINED_PLAYERS[1])],
      };
      addPlayerToMap(mockGameState);

      const player1Tiles = Object.values(mockGameState.battlefield.lands).filter(
        (tile) => tile.controlledBy === PREDEFINED_PLAYERS[0].id
      );
      const player2Tiles = Object.values(mockGameState.battlefield.lands).filter(
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
      const somePredefinedPlayers = PREDEFINED_PLAYERS.slice(0, 4).map(toGamePlayer);
      const mockGameState: GameState = {
        battlefield: generateMap({ rows: 11, cols: 23 }),
        turn: 0,
        activePlayerId: somePredefinedPlayers[0].id,
        players: somePredefinedPlayers,
      };
      addPlayerToMap(mockGameState);

      // Should assign all players
      const assignedPlayerIds = new Set();
      Object.values(mockGameState.battlefield.lands).forEach((tile) => {
        if (tile.controlledBy !== NO_PLAYER.id) {
          assignedPlayerIds.add(tile.controlledBy);
        }
      });

      expect(assignedPlayerIds.size).toBe(somePredefinedPlayers.length);

      // Check that necromancer players got volcano
      const volcanoTiles = Object.values(mockGameState.battlefield.lands).filter(
        (tile) => tile.land.id === LAND_TYPE.VOLCANO
      );
      expect(volcanoTiles.length).toBe(1);

      const volcanoOwner = volcanoTiles[0].controlledBy;
      const volcanoOwnerPlayer = somePredefinedPlayers.find((p) => p.id === volcanoOwner);
      expect(volcanoOwnerPlayer?.race).toBe('Undead');
    });

    it('should handle multiple necromancers competing for volcano', () => {
      const necromancers = PREDEFINED_PLAYERS.filter((p) => p.race === 'Undead')
        .slice(0, 2)
        .map(toGamePlayer);

      const mockGameState: GameState = {
        battlefield: generateMap({ rows: 9, cols: 18 }),
        turn: 0,
        activePlayerId: necromancers[0].id,
        players: necromancers,
      };
      addPlayerToMap(mockGameState);

      // Only one can own the volcano
      const volcanoTiles = Object.values(mockGameState.battlefield.lands).filter(
        (tile) => tile.land.id === LAND_TYPE.VOLCANO
      );
      expect(volcanoTiles.length).toBe(1);

      const volcanoOwner = volcanoTiles[0].controlledBy;
      expect(necromancers.some((n) => n.id === volcanoOwner)).toBe(true);

      // The other necromancer should still be assigned somewhere
      const assignedPlayerIds = new Set();
      Object.values(mockGameState.battlefield.lands).forEach((tile) => {
        if (tile.controlledBy !== NO_PLAYER.id) {
          assignedPlayerIds.add(tile.controlledBy);
        }
      });

      expect(assignedPlayerIds.size).toBe(necromancers.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty player array gracefully', () => {
      const mockGameState: GameState = {
        battlefield: generateMap({ rows: 9, cols: 18 }), // test verifies only initializeMap
        turn: 0,
        activePlayerId: toGamePlayer(PREDEFINED_PLAYERS[0]).id,
        players: [toGamePlayer(PREDEFINED_PLAYERS[0])],
      };

      Object.values(mockGameState.battlefield.lands).forEach((tile) => {
        expect(tile.controlledBy).toBe(NO_PLAYER.id);
        expect(tile.buildings.length).toBe(0);
      });
    });

    it('should handle single player', () => {
      const singlePlayer = toGamePlayer(PREDEFINED_PLAYERS[3]);
      const mockGameState: GameState = {
        battlefield: generateMap({ rows: 9, cols: 18 }),
        turn: 0,
        activePlayerId: singlePlayer.id,
        players: [singlePlayer],
      };
      addPlayerToMap(mockGameState);

      const playerTiles = Object.values(mockGameState.battlefield.lands).filter(
        (tile) => tile.controlledBy === singlePlayer.id
      );

      expect(playerTiles.length).toBeGreaterThan(0);

      const strongholdTiles = Object.values(mockGameState.battlefield.lands).filter((tile) =>
        tile.buildings.some((building) => building.id === BuildingType.STRONGHOLD)
      );

      expect(strongholdTiles.length).toBe(1);
    });

    it('should maintain map integrity after player assignment', () => {
      const dimensions = { rows: 9, cols: 18 };
      const testPlayers = PREDEFINED_PLAYERS.slice(0, 3).map(toGamePlayer);
      const mockGameState: GameState = {
        battlefield: generateMap(dimensions),
        turn: 0,
        activePlayerId: testPlayers[0].id,
        players: [testPlayers[0], testPlayers[1], testPlayers[2]],
      };
      addPlayerToMap(mockGameState);

      // Check all expected tiles exist
      for (let row = 0; row < dimensions.rows; row++) {
        const colsInRow = row % 2 === 0 ? dimensions.cols : dimensions.cols - 1;
        for (let col = 0; col < colsInRow; col++) {
          const tileId = battlefieldLandId({ row: row, col: col });
          expect(mockGameState.battlefield.lands[tileId]).toBeDefined();
          expect(mockGameState.battlefield.lands[tileId].mapPos.row).toBe(row);
          expect(mockGameState.battlefield.lands[tileId].mapPos.col).toBe(col);
        }
      }

      // Check no invalid land types
      Object.values(mockGameState.battlefield.lands).forEach((tile) => {
        expect(tile.land.id).not.toBe(LAND_TYPE.NONE);
      });
    });
  });
});
