import { initializeMap } from '../map/generation/mapGeneration';
import { LAND_TYPES } from '../types/Land';
import { BUILDING_TYPES } from '../types/Building';
import { NO_PLAYER, PREDEFINED_PLAYERS } from '../types/GamePlayer';
import { BattlefieldSize, getBattlefieldDimensions } from '../types/BattlefieldSize';
import { createTileId } from '../types/HexTileState';
import { calculateHexDistance } from '../map/utils/mapAlgorithms';

describe('Map Generation with Players', () => {
  describe('Basic Map Generation Without Players', () => {
    it('should generate map without players when no players provided', () => {
      const mapSize: BattlefieldSize = 'medium';
      const tiles = initializeMap(mapSize);

      // Should generate tiles
      expect(Object.keys(tiles).length).toBeGreaterThan(0);

      // All tiles should be controlled by a neutral player
      Object.values(tiles).forEach((tile) => {
        expect(tile.controlledBy).toBe(NO_PLAYER.id);
      });

      // Should have volcano and lava tiles
      const volcanoTiles = Object.values(tiles).filter((tile) => tile.landType.id === 'volcano');
      const lavaTiles = Object.values(tiles).filter((tile) => tile.landType.id === 'lava');

      expect(volcanoTiles.length).toBe(1);
      expect(lavaTiles.length).toBeGreaterThan(0);
    });
  });

  describe('Player Positioning', () => {
    it('should assign necromancer to volcano land', () => {
      const mapSize: BattlefieldSize = 'medium';
      const necromancerPlayer = PREDEFINED_PLAYERS[1]; // Undead necromancer
      const tiles = initializeMap(mapSize, [necromancerPlayer]);

      // Find volcano tile
      const volcanoTiles = Object.values(tiles).filter((tile) => tile.landType.id === 'volcano');
      expect(volcanoTiles.length).toBe(1);

      const volcanoTile = volcanoTiles[0];
      expect(volcanoTile.controlledBy).toBe(necromancerPlayer.id);
    });

    it('should assign stronghold building to player homelands', () => {
      const mapSize: BattlefieldSize = 'medium';
      const testPlayers = PREDEFINED_PLAYERS.slice(0, 3);
      const tiles = initializeMap(mapSize, testPlayers);

      // Find player-owned tiles
      const playerTiles = Object.values(tiles).filter((tile) => tile.controlledBy !== NO_PLAYER.id);

      expect(playerTiles.length).toBeGreaterThan(0);

      // Find strongholds
      const strongholdTiles = Object.values(tiles).filter((tile) =>
        tile.buildings.some((building) => building.id === 'stronghold')
      );

      expect(strongholdTiles.length).toBe(testPlayers.length);

      // Each stronghold should be on a player's homeland
      strongholdTiles.forEach((strongholdTile) => {
        expect(strongholdTile.controlledBy).not.toBe(NO_PLAYER.id);
        expect(strongholdTile.buildings).toEqual([BUILDING_TYPES.stronghold]);
      });
    });

    it('should assign lands based on player alignment', () => {
      const mapSize: BattlefieldSize = 'small';
      const testPlayers = PREDEFINED_PLAYERS.slice(0, 3);
      const tiles = initializeMap(mapSize, testPlayers);

      const playersTiles = Object.values(tiles).filter(
        (tile) => tile.controlledBy !== NO_PLAYER.id
      );

      expect(playersTiles.length).toBeGreaterThan(0);

      // Check if the homeland (stronghold tile) has appropriate alignment or is a volcano for necromancer
      const strongholdTile = playersTiles.filter((tile) =>
        tile.buildings.some((building) => building.id === 'stronghold')
      );

      expect(strongholdTile).toBeDefined();
      expect(strongholdTile.length).toBe(testPlayers.length);

      // For any player it should be either players.alignment or neutral
      strongholdTile!.forEach((tile) => {
        const testPlayer = testPlayers.find((p) => p.id === tile.controlledBy);
        expect(testPlayer).toBeDefined();
        expect(
          tile.landType.alignment === testPlayer?.alignment || tile.landType.alignment === 'neutral'
        ).toBeTruthy();
      });
    });

    it('should maintain player distance constraints', () => {
      const mapSize: BattlefieldSize = 'large';
      const testPlayers = PREDEFINED_PLAYERS.slice(0, 3);
      const tiles = initializeMap(mapSize, testPlayers);

      // Find stronghold positions (homelands)
      const strongholdTiles = Object.values(tiles).filter((tile) =>
        tile.buildings.some((building) => building.id === 'stronghold')
      );

      expect(strongholdTiles.length).toBe(testPlayers.length);
      expect(
        calculateHexDistance(mapSize, strongholdTiles[0].mapPos, strongholdTiles[1].mapPos)
      ).toBeGreaterThanOrEqual(3);
      expect(
        calculateHexDistance(mapSize, strongholdTiles[0].mapPos, strongholdTiles[2].mapPos)
      ).toBeGreaterThanOrEqual(3);
      expect(
        calculateHexDistance(mapSize, strongholdTiles[1].mapPos, strongholdTiles[2].mapPos)
      ).toBeGreaterThanOrEqual(3);
    });

    it('should assign lands within radius 2 of strongholds', () => {
      const mapSize: BattlefieldSize = 'medium';
      const singlePlayer = [PREDEFINED_PLAYERS[0]];
      const tiles = initializeMap(mapSize, singlePlayer);

      const strongholdTile = Object.values(tiles).find((tile) =>
        tile.buildings.some((building) => building.id === 'stronghold')
      );

      expect(strongholdTile).toBeDefined();

      const playerTiles = Object.values(tiles).filter(
        (tile) => tile.controlledBy === singlePlayer[0].id
      );

      // All player tiles should be within radius 2 of the stronghold
      playerTiles.forEach((tile) => {
        expect(
          calculateHexDistance(mapSize, strongholdTile!.mapPos, tile.mapPos)
        ).toBeLessThanOrEqual(2);
      });

      // Should have multiple tiles (stronghold + surrounding)
      expect(playerTiles.length).toBeGreaterThan(1);
    });

    it('should handle conflicts where multiple players could own same land', () => {
      const mapSize: BattlefieldSize = 'small'; // Small map to force overlaps
      const tiles = initializeMap(mapSize, PREDEFINED_PLAYERS.slice(0, 2)); // Use only 2 players

      const player1Tiles = Object.values(tiles).filter(
        (tile) => tile.controlledBy === PREDEFINED_PLAYERS[0].id
      );
      const player2Tiles = Object.values(tiles).filter(
        (tile) => tile.controlledBy === PREDEFINED_PLAYERS[1].id
      );

      expect(player1Tiles.length).toBeGreaterThan(0);
      expect(player2Tiles.length).toBeGreaterThan(0);

      // No tile should be owned by multiple players
      const player1TilesIds = player1Tiles.map((tile) => createTileId(tile.mapPos));
      const player2TilesIds = player2Tiles.map((tile) => createTileId(tile.mapPos));
      expect(player1TilesIds.every((id) => !player2TilesIds.includes(id))).toBeTruthy();
    });
  });

  describe('Integration with Predefined Players', () => {
    it('should work with predefined players from GamePlayer', () => {
      const mapSize: BattlefieldSize = 'large';
      const somePredefinedPlayers = PREDEFINED_PLAYERS.slice(0, 4);
      const tiles = initializeMap(mapSize, somePredefinedPlayers);

      // Should assign all players
      const assignedPlayerIds = new Set();
      Object.values(tiles).forEach((tile) => {
        if (tile.controlledBy !== NO_PLAYER.id) {
          assignedPlayerIds.add(tile.controlledBy);
        }
      });

      expect(assignedPlayerIds.size).toBe(somePredefinedPlayers.length);

      // Check that necromancer players got volcano
      const volcanoTiles = Object.values(tiles).filter((tile) => tile.landType.id === 'volcano');
      expect(volcanoTiles.length).toBe(1);

      const volcanoOwner = volcanoTiles[0].controlledBy;
      const volcanoOwnerPlayer = somePredefinedPlayers.find((p) => p.id === volcanoOwner);
      expect(volcanoOwnerPlayer?.race).toBe('Undead');
    });

    it('should handle multiple necromancers competing for volcano', () => {
      const mapSize: BattlefieldSize = 'medium';
      const necromancers = PREDEFINED_PLAYERS.filter((p) => p.race === 'Undead').slice(0, 2);

      const tiles = initializeMap(mapSize, necromancers);

      // Only one can own the volcano
      const volcanoTiles = Object.values(tiles).filter((tile) => tile.landType.id === 'volcano');
      expect(volcanoTiles.length).toBe(1);

      const volcanoOwner = volcanoTiles[0].controlledBy;
      expect(necromancers.some((n) => n.id === volcanoOwner)).toBe(true);

      // The other necromancer should still be assigned somewhere
      const assignedPlayerIds = new Set();
      Object.values(tiles).forEach((tile) => {
        if (tile.controlledBy !== NO_PLAYER.id) {
          assignedPlayerIds.add(tile.controlledBy);
        }
      });

      expect(assignedPlayerIds.size).toBe(necromancers.length);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty player array gracefully', () => {
      const mapSize: BattlefieldSize = 'medium';
      const tiles = initializeMap(mapSize, []);

      Object.values(tiles).forEach((tile) => {
        expect(tile.controlledBy).toBe(NO_PLAYER.id);
        expect(tile.buildings.length).toBe(0);
      });
    });

    it('should handle single player', () => {
      const mapSize: BattlefieldSize = 'medium';
      const singlePlayer = [PREDEFINED_PLAYERS[3]];
      const tiles = initializeMap(mapSize, singlePlayer);

      const playerTiles = Object.values(tiles).filter(
        (tile) => tile.controlledBy === singlePlayer[0].id
      );

      expect(playerTiles.length).toBeGreaterThan(0);

      const strongholdTiles = Object.values(tiles).filter((tile) =>
        tile.buildings.some((building) => building.id === 'stronghold')
      );

      expect(strongholdTiles.length).toBe(1);
    });

    it('should maintain map integrity after player assignment', () => {
      const mapSize: BattlefieldSize = 'medium';
      const { rows, cols } = getBattlefieldDimensions(mapSize);
      const tiles = initializeMap(mapSize, PREDEFINED_PLAYERS.slice(0, 3));

      // Check all expected tiles exist
      for (let row = 0; row < rows; row++) {
        const colsInRow = row % 2 === 0 ? cols : cols - 1;
        for (let col = 0; col < colsInRow; col++) {
          const tileId = createTileId({ row: row, col: col });
          expect(tiles[tileId]).toBeDefined();
          expect(tiles[tileId].mapPos.row).toBe(row);
          expect(tiles[tileId].mapPos.col).toBe(col);
        }
      }

      // Check no invalid land types
      Object.values(tiles).forEach((tile) => {
        expect(tile.landType.id).not.toBe(LAND_TYPES.none.id);
        expect(Object.keys(LAND_TYPES)).toContain(tile.landType.id);
      });
    });
  });
});
