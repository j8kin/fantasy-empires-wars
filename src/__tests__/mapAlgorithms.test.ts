import { getBattlefieldDimensions } from '../types/BattlefieldSize';
import { calculateHexDistance, getTilesInRadius } from '../map/utils/mapAlgorithms';
import { LandPosition } from '../map/utils/mapLands';

describe('Map Algorithms', () => {
  const comparePositions = (expected: LandPosition, actual: LandPosition) => {
    expect(actual.row).toBe(expected.row);
    expect(actual.col).toBe(expected.col);
  };

  describe('Get Neighboring Hexes in Radius', () => {
    describe('Number of Tiles in Radius for Corners', () => {
      const mapSize = 'small';

      const mapDimensions = getBattlefieldDimensions(mapSize);

      const LeftUpperCorner = { row: 0, col: 0 };
      const RightUpperCorner = { row: 0, col: mapDimensions.cols - 1 };
      const LeftBottomCorner = { row: mapDimensions.rows - 1, col: 0 };
      const RightBottomCorner = { row: mapDimensions.rows - 1, col: mapDimensions.cols - 2 };

      it('should return all hexes for Left Upper corner', () => {
        const position = LeftUpperCorner;
        let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);
        expect(tilesInRadius.length).toBe(1);
        comparePositions(tilesInRadius[0], position);

        tilesInRadius = getTilesInRadius(mapDimensions, position, 1);
        expect(tilesInRadius.length).toBe(3);
        comparePositions(tilesInRadius[0], position);
        comparePositions(tilesInRadius[1], { row: position.row, col: position.col + 1 });
        comparePositions(tilesInRadius[2], { row: position.row + 1, col: position.col });

        tilesInRadius = getTilesInRadius(mapDimensions, position, 2);
        expect(tilesInRadius.length).toBe(7);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        comparePositions(tilesInRadius[1], { row: position.row, col: position.col + 1 });
        comparePositions(tilesInRadius[2], { row: position.row + 1, col: position.col });
        comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 2 });
        comparePositions(tilesInRadius[4], { row: position.row + 1, col: position.col + 1 });
        comparePositions(tilesInRadius[5], { row: position.row + 2, col: position.col + 1 });
        comparePositions(tilesInRadius[6], { row: position.row + 2, col: position.col });
      });

      it('should return all hexes for Right Upper corner', () => {
        const position = RightUpperCorner;
        let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);
        expect(tilesInRadius.length).toBe(1);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });

        tilesInRadius = getTilesInRadius(mapDimensions, position, 1);
        expect(tilesInRadius.length).toBe(3);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        comparePositions(tilesInRadius[1], { row: position.row + 1, col: position.col - 1 });
        comparePositions(tilesInRadius[2], { row: position.row, col: position.col - 1 });

        tilesInRadius = getTilesInRadius(mapDimensions, position, 2);
        expect(tilesInRadius.length).toBe(7);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        comparePositions(tilesInRadius[1], { row: position.row + 1, col: position.col - 1 });
        comparePositions(tilesInRadius[2], { row: position.row, col: position.col - 1 });
        comparePositions(tilesInRadius[3], { row: position.row + 2, col: position.col });
        comparePositions(tilesInRadius[4], { row: position.row + 2, col: position.col - 1 });
        comparePositions(tilesInRadius[5], { row: position.row + 1, col: position.col - 2 });
        comparePositions(tilesInRadius[6], { row: position.row, col: position.col - 2 });
      });

      it('should return all hexes for Left Bottom corner', () => {
        const position = LeftBottomCorner;
        let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);
        expect(tilesInRadius.length).toBe(1);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });

        tilesInRadius = getTilesInRadius(mapDimensions, position, 1);
        expect(tilesInRadius.length).toBe(4);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
        comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col + 1 });
        comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 1 });

        tilesInRadius = getTilesInRadius(mapDimensions, position, 2);
        expect(tilesInRadius.length).toBe(8);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
        comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col + 1 });
        comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 1 });
        comparePositions(tilesInRadius[4], { row: position.row - 2, col: position.col });
        comparePositions(tilesInRadius[5], { row: position.row - 2, col: position.col + 1 });
        comparePositions(tilesInRadius[6], { row: position.row - 1, col: position.col + 2 });
        comparePositions(tilesInRadius[7], { row: position.row, col: position.col + 2 });
      });

      it('should return all hexes for Right Bottom corner', () => {
        const position = RightBottomCorner;
        let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);
        expect(tilesInRadius.length).toBe(1);
        expect(tilesInRadius[0].row).toBe(position.row);
        expect(tilesInRadius[0].col).toBe(position.col);

        tilesInRadius = getTilesInRadius(mapDimensions, position, 1);
        expect(tilesInRadius.length).toBe(4);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
        comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col + 1 });
        comparePositions(tilesInRadius[3], { row: position.row, col: position.col - 1 });

        tilesInRadius = getTilesInRadius(mapDimensions, position, 2);
        expect(tilesInRadius.length).toBe(8);
        comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
        comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col + 1 });
        comparePositions(tilesInRadius[3], { row: position.row, col: position.col - 1 });
        comparePositions(tilesInRadius[4], { row: position.row - 2, col: position.col - 1 });
        comparePositions(tilesInRadius[5], { row: position.row - 2, col: position.col });
        comparePositions(tilesInRadius[6], { row: position.row - 1, col: position.col - 1 });
        comparePositions(tilesInRadius[7], { row: position.row, col: position.col - 2 });
      });
    });

    describe('Number of Tiles in Radius for Middle of borders', () => {
      const mapSize = 'large';
      const mapDimensions = getBattlefieldDimensions(mapSize);

      describe('Upper Border', () => {
        const position = { row: 0, col: Math.ceil(mapDimensions.cols / 2) };
        it('should return all hexes for Radius 0', () => {
          const tilesInRadius = getTilesInRadius(mapDimensions, position, 0);

          expect(tilesInRadius.length).toBe(1);
          comparePositions(tilesInRadius[0], position);
        });

        it('should return all hexes for Radius 1', () => {
          let tilesInRadius = getTilesInRadius(mapDimensions, position, 1);

          expect(tilesInRadius.length).toBe(5);
          comparePositions(tilesInRadius[0], position);
          comparePositions(tilesInRadius[1], { row: position.row, col: position.col + 1 });
          comparePositions(tilesInRadius[2], { row: position.row + 1, col: position.col });
          comparePositions(tilesInRadius[3], { row: position.row + 1, col: position.col - 1 });
          comparePositions(tilesInRadius[4], { row: position.row, col: position.col - 1 });
        });

        it('should return all hexes for Radius 2', () => {
          let tilesInRadius = getTilesInRadius(mapDimensions, position, 2);

          expect(tilesInRadius.length).toBe(12);
          comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
          comparePositions(tilesInRadius[1], { row: position.row, col: position.col + 1 });
          comparePositions(tilesInRadius[2], { row: position.row + 1, col: position.col });
          comparePositions(tilesInRadius[3], { row: position.row + 1, col: position.col - 1 });
          comparePositions(tilesInRadius[4], { row: position.row, col: position.col - 1 });
          comparePositions(tilesInRadius[5], { row: position.row, col: position.col + 2 });
          comparePositions(tilesInRadius[6], { row: position.row + 1, col: position.col + 1 });
          comparePositions(tilesInRadius[7], { row: position.row + 2, col: position.col + 1 });
          comparePositions(tilesInRadius[8], { row: position.row + 2, col: position.col });
          comparePositions(tilesInRadius[9], { row: position.row + 2, col: position.col - 1 });
          comparePositions(tilesInRadius[10], { row: position.row + 1, col: position.col - 2 });
          comparePositions(tilesInRadius[11], { row: position.row, col: position.col - 2 });
        });
      });

      describe('Bottom Border', () => {
        const position = { row: mapDimensions.rows - 1, col: Math.ceil(mapDimensions.cols / 2) };
        it('should return all hexes for Radius 0', () => {
          let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);

          expect(tilesInRadius.length).toBe(1);
          comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        });

        it('should return all hexes for Radius 1', () => {
          let tilesInRadius = getTilesInRadius(mapDimensions, position, 1);

          expect(tilesInRadius.length).toBe(5);
          comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
          comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col - 1 });
          comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col });
          comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 1 });
          comparePositions(tilesInRadius[4], { row: position.row, col: position.col - 1 });
        });

        it('should return all hexes for Radius 2', () => {
          let tilesInRadius = getTilesInRadius(mapDimensions, position, 2);

          expect(tilesInRadius.length).toBe(12);
          comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
          comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col - 1 });
          comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col });
          comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 1 });
          comparePositions(tilesInRadius[4], { row: position.row, col: position.col - 1 });

          comparePositions(tilesInRadius[5], { row: position.row - 2, col: position.col - 1 });
          comparePositions(tilesInRadius[6], { row: position.row - 2, col: position.col });
          comparePositions(tilesInRadius[7], { row: position.row - 1, col: position.col - 2 });
          comparePositions(tilesInRadius[8], { row: position.row - 2, col: position.col + 1 });
          comparePositions(tilesInRadius[9], { row: position.row - 1, col: position.col + 1 });
          comparePositions(tilesInRadius[10], { row: position.row, col: position.col + 2 });
          comparePositions(tilesInRadius[11], { row: position.row, col: position.col - 2 });
        });
      });

      describe('Left Border', () => {
        describe('Even Rows', () => {
          const position = { row: Math.ceil(mapDimensions.rows / 2), col: 0 };

          it('should return all hexes for Radius 0', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);

            expect(tilesInRadius.length).toBe(1);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
          });

          it('should return all hexes for Radius 1', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 1);

            expect(tilesInRadius.length).toBe(4);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
            comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
            comparePositions(tilesInRadius[2], { row: position.row, col: position.col + 1 });
            comparePositions(tilesInRadius[3], { row: position.row + 1, col: position.col });
          });

          it('should return all hexes for Radius 2', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 2);

            expect(tilesInRadius.length).toBe(11);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
            comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
            comparePositions(tilesInRadius[2], { row: position.row, col: position.col + 1 });
            comparePositions(tilesInRadius[3], { row: position.row + 1, col: position.col });
            comparePositions(tilesInRadius[4], { row: position.row - 2, col: position.col });
            comparePositions(tilesInRadius[5], { row: position.row - 2, col: position.col + 1 });
            comparePositions(tilesInRadius[6], { row: position.row - 1, col: position.col + 1 });
            comparePositions(tilesInRadius[7], { row: position.row, col: position.col + 2 });
            comparePositions(tilesInRadius[8], { row: position.row + 1, col: position.col + 1 });
            comparePositions(tilesInRadius[9], { row: position.row + 2, col: position.col + 1 });
            comparePositions(tilesInRadius[10], { row: position.row + 2, col: position.col });
          });
        });

        describe('Odd Rows', () => {
          const position = { row: Math.ceil(mapDimensions.rows / 2) + 1, col: 0 };

          it('should return all hexes for Radius 0', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);

            expect(tilesInRadius.length).toBe(1);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
          });

          it('should return all hexes for Radius 1', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 1);

            expect(tilesInRadius.length).toBe(6);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
            comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
            comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col + 1 });
            comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 1 });
            comparePositions(tilesInRadius[4], { row: position.row + 1, col: position.col + 1 });
            comparePositions(tilesInRadius[5], { row: position.row + 1, col: position.col });
          });

          it('should return all hexes for Radius 2', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 2);

            expect(tilesInRadius.length).toBe(13);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
            comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
            comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col + 1 });
            comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 1 });
            comparePositions(tilesInRadius[4], { row: position.row + 1, col: position.col + 1 });
            comparePositions(tilesInRadius[5], { row: position.row + 1, col: position.col });

            comparePositions(tilesInRadius[6], { row: position.row - 2, col: position.col });
            comparePositions(tilesInRadius[7], { row: position.row - 2, col: position.col + 1 });
            comparePositions(tilesInRadius[8], { row: position.row - 1, col: position.col + 2 });
            comparePositions(tilesInRadius[9], { row: position.row, col: position.col + 2 });
            comparePositions(tilesInRadius[10], { row: position.row + 1, col: position.col + 2 });
            comparePositions(tilesInRadius[11], { row: position.row + 2, col: position.col + 1 });
            comparePositions(tilesInRadius[12], { row: position.row + 2, col: position.col });
          });
        });
      });

      describe('Right Border', () => {
        describe('Even Rows', () => {
          const position = { row: Math.ceil(mapDimensions.rows / 2), col: mapDimensions.cols - 1 };

          it('should return all hexes for Radius 0', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);

            expect(tilesInRadius.length).toBe(1);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
          });

          it('should return all hexes for Radius 1', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 1);

            expect(tilesInRadius.length).toBe(4);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
            comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col - 1 });
            comparePositions(tilesInRadius[2], { row: position.row + 1, col: position.col - 1 });
            comparePositions(tilesInRadius[3], { row: position.row, col: position.col - 1 });
          });

          it('should return all hexes for Radius 2', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 2);

            expect(tilesInRadius.length).toBe(11);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
            comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col - 1 });
            comparePositions(tilesInRadius[2], { row: position.row + 1, col: position.col - 1 });
            comparePositions(tilesInRadius[3], { row: position.row, col: position.col - 1 });

            comparePositions(tilesInRadius[4], { row: position.row - 2, col: position.col - 1 });
            comparePositions(tilesInRadius[5], { row: position.row - 2, col: position.col });
            comparePositions(tilesInRadius[6], { row: position.row - 1, col: position.col - 2 });
            comparePositions(tilesInRadius[7], { row: position.row + 2, col: position.col });
            comparePositions(tilesInRadius[8], { row: position.row + 2, col: position.col - 1 });
            comparePositions(tilesInRadius[9], { row: position.row + 1, col: position.col - 2 });
            comparePositions(tilesInRadius[10], { row: position.row, col: position.col - 2 });
          });
        });

        describe('Odd Rows', () => {
          const position = {
            row: Math.ceil(mapDimensions.rows / 2) + 1,
            col: mapDimensions.cols - 2,
          };

          it('should return all hexes for Radius 0', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 0);

            expect(tilesInRadius.length).toBe(1);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
          });

          it('should return all hexes for Radius 1', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 1);

            expect(tilesInRadius.length).toBe(6);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
            comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
            comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col + 1 });
            comparePositions(tilesInRadius[3], { row: position.row + 1, col: position.col + 1 });
            comparePositions(tilesInRadius[4], { row: position.row + 1, col: position.col });
            comparePositions(tilesInRadius[5], { row: position.row, col: position.col - 1 });
          });

          it('should return all hexes for Radius 2', () => {
            let tilesInRadius = getTilesInRadius(mapDimensions, position, 2);

            expect(tilesInRadius.length).toBe(13);
            comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
            comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col });
            comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col + 1 });
            comparePositions(tilesInRadius[3], { row: position.row + 1, col: position.col + 1 });
            comparePositions(tilesInRadius[4], { row: position.row + 1, col: position.col });
            comparePositions(tilesInRadius[5], { row: position.row, col: position.col - 1 });

            comparePositions(tilesInRadius[6], { row: position.row - 2, col: position.col - 1 });
            comparePositions(tilesInRadius[7], { row: position.row - 2, col: position.col });
            comparePositions(tilesInRadius[8], { row: position.row - 1, col: position.col - 1 });
            comparePositions(tilesInRadius[9], { row: position.row + 2, col: position.col });
            comparePositions(tilesInRadius[10], { row: position.row + 2, col: position.col - 1 });
            comparePositions(tilesInRadius[11], { row: position.row + 1, col: position.col - 1 });
            comparePositions(tilesInRadius[12], { row: position.row, col: position.col - 2 });
          });
        });
      });

      describe('Middle', () => {
        const position = {
          row: Math.ceil(mapDimensions.rows / 2),
          col: Math.ceil(mapDimensions.cols / 2),
        };
        it('should return all hexes for Radius 0', () => {
          const tilesInRadius = getTilesInRadius(mapDimensions, position, 0);

          expect(tilesInRadius.length).toBe(1);
          comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
        });

        it('should return all hexes for Radius 1', () => {
          const tilesInRadius = getTilesInRadius(mapDimensions, position, 1);

          expect(tilesInRadius.length).toBe(7);
          comparePositions(tilesInRadius[0], { row: position.row, col: position.col });
          comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col - 1 });
          comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col });
          comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 1 });
          comparePositions(tilesInRadius[4], { row: position.row + 1, col: position.col });
          comparePositions(tilesInRadius[5], { row: position.row + 1, col: position.col - 1 });
          comparePositions(tilesInRadius[6], { row: position.row, col: position.col - 1 });
        });

        it('should return all hexes for Radius 2', () => {
          const tilesInRadius = getTilesInRadius(mapDimensions, position, 2);

          expect(tilesInRadius.length).toBe(19);
          comparePositions(tilesInRadius[0], { row: position.row, col: position.col });

          comparePositions(tilesInRadius[1], { row: position.row - 1, col: position.col - 1 });
          comparePositions(tilesInRadius[2], { row: position.row - 1, col: position.col });
          comparePositions(tilesInRadius[3], { row: position.row, col: position.col + 1 });
          comparePositions(tilesInRadius[4], { row: position.row + 1, col: position.col });
          comparePositions(tilesInRadius[5], { row: position.row + 1, col: position.col - 1 });
          comparePositions(tilesInRadius[6], { row: position.row, col: position.col - 1 });

          comparePositions(tilesInRadius[7], { row: position.row - 2, col: position.col - 1 });
          comparePositions(tilesInRadius[8], { row: position.row - 2, col: position.col });
          comparePositions(tilesInRadius[9], { row: position.row - 1, col: position.col - 2 });
          comparePositions(tilesInRadius[10], { row: position.row - 2, col: position.col + 1 });
          comparePositions(tilesInRadius[11], { row: position.row - 1, col: position.col + 1 });
          comparePositions(tilesInRadius[12], { row: position.row, col: position.col + 2 });
          comparePositions(tilesInRadius[13], { row: position.row + 1, col: position.col + 1 });
          comparePositions(tilesInRadius[14], { row: position.row + 2, col: position.col + 1 });
          comparePositions(tilesInRadius[15], { row: position.row + 2, col: position.col });
          comparePositions(tilesInRadius[16], { row: position.row + 2, col: position.col - 1 });
          comparePositions(tilesInRadius[17], { row: position.row + 1, col: position.col - 2 });
          comparePositions(tilesInRadius[18], { row: position.row, col: position.col - 2 });
        });
      });
    });
  });

  describe('Calculate Hex Distance', () => {
    it('should calculate distance between two hexagonal coordinates. Left Upper Corner', () => {
      expect(
        calculateHexDistance({ rows: 9, cols: 18 }, { row: 0, col: 0 }, { row: 0, col: 0 })
      ).toBe(0);

      expect(
        calculateHexDistance({ rows: 9, cols: 18 }, { row: 0, col: 0 }, { row: 0, col: 1 })
      ).toBe(1);
      expect(
        calculateHexDistance({ rows: 9, cols: 18 }, { row: 0, col: 0 }, { row: 1, col: 0 })
      ).toBe(1);

      expect(
        calculateHexDistance({ rows: 9, cols: 18 }, { row: 0, col: 0 }, { row: 1, col: 1 })
      ).toBe(2);
      expect(
        calculateHexDistance({ rows: 9, cols: 18 }, { row: 0, col: 0 }, { row: 0, col: 2 })
      ).toBe(2);
      expect(
        calculateHexDistance({ rows: 9, cols: 18 }, { row: 0, col: 0 }, { row: 2, col: 0 })
      ).toBe(2);
    });

    it('should calculate distance between two hexagonal coordinates. Left Bottom Corner', () => {
      const size = 'small';
      const rows = getBattlefieldDimensions(size).rows - 1;
      expect(rows % 2).toBe(1);

      expect(
        calculateHexDistance(
          { rows: getBattlefieldDimensions(size).rows, cols: 18 },
          { row: rows, col: 0 },
          { row: rows, col: 0 }
        )
      ).toBe(0);

      expect(
        calculateHexDistance(
          { rows: getBattlefieldDimensions(size).rows, cols: 18 },
          { row: rows, col: 0 },
          { row: rows, col: 1 }
        )
      ).toBe(1);
      expect(
        calculateHexDistance(
          { rows: getBattlefieldDimensions(size).rows, cols: 18 },
          { row: rows, col: 0 },
          { row: rows - 1, col: 0 }
        )
      ).toBe(1);
      expect(
        calculateHexDistance(
          { rows: getBattlefieldDimensions(size).rows, cols: 18 },
          { row: rows, col: 0 },
          { row: rows - 1, col: 1 }
        )
      ).toBe(1);

      expect(
        calculateHexDistance(
          { rows: getBattlefieldDimensions(size).rows, cols: 18 },
          { row: rows, col: 0 },
          { row: rows - 2, col: 0 }
        )
      ).toBe(2);
      expect(
        calculateHexDistance(
          { rows: getBattlefieldDimensions(size).rows, cols: 18 },
          { row: rows, col: 0 },
          { row: rows - 2, col: 1 }
        )
      ).toBe(2);
      expect(
        calculateHexDistance(
          { rows: getBattlefieldDimensions(size).rows, cols: 18 },
          { row: rows, col: 0 },
          { row: rows - 1, col: 2 }
        )
      ).toBe(2);
      expect(
        calculateHexDistance(
          { rows: getBattlefieldDimensions(size).rows, cols: 18 },
          { row: rows, col: 0 },
          { row: rows, col: 2 }
        )
      ).toBe(2);
    });

    it('should calculate distance between two hexagonal coordinates. Right Upper Corner', () => {
      const size = 'medium';
      const cols = getBattlefieldDimensions(size).cols - 1;
      expect(
        calculateHexDistance(
          { rows: 9, cols: getBattlefieldDimensions(size).cols },
          { row: 0, col: cols },
          { row: 0, col: cols }
        )
      ).toBe(0);

      expect(
        calculateHexDistance(
          { rows: 9, cols: getBattlefieldDimensions(size).cols },
          { row: 0, col: cols },
          { row: 0, col: cols - 1 }
        )
      ).toBe(1);
      expect(
        calculateHexDistance(
          { rows: 9, cols: getBattlefieldDimensions(size).cols },
          { row: 0, col: cols },
          { row: 1, col: cols - 1 }
        )
      ).toBe(1); // even rows has 1 less column

      expect(
        calculateHexDistance(
          { rows: 9, cols: getBattlefieldDimensions(size).cols },
          { row: 0, col: cols },
          { row: 1, col: cols - 2 }
        )
      ).toBe(2); // even rows has 1 less column
      expect(
        calculateHexDistance(
          { rows: 9, cols: getBattlefieldDimensions(size).cols },
          { row: 0, col: cols },
          { row: 0, col: cols - 2 }
        )
      ).toBe(2);
      expect(
        calculateHexDistance(
          { rows: 9, cols: getBattlefieldDimensions(size).cols },
          { row: 0, col: cols },
          { row: 2, col: cols }
        )
      ).toBe(2);

      expect(
        calculateHexDistance(
          { rows: 9, cols: getBattlefieldDimensions(size).cols },
          { row: 0, col: cols },
          { row: 1, col: cols }
        )
      ).toBe(-1); // the second position is not exists since on even rows there is 1 less column
    });

    it('should calculate distance between two hexagonal coordinates. Right Bottom Corner', () => {
      const size = 'huge';
      let { rows, cols } = getBattlefieldDimensions(size);
      rows -= 1;
      cols -= 1;
      expect(
        calculateHexDistance(
          getBattlefieldDimensions(size),
          { row: rows, col: cols },
          { row: rows, col: cols }
        )
      ).toBe(0);

      expect(
        calculateHexDistance(
          getBattlefieldDimensions(size),
          { row: rows, col: cols },
          { row: rows, col: cols - 1 }
        )
      ).toBe(1);
      expect(
        calculateHexDistance(
          getBattlefieldDimensions(size),
          { row: rows, col: cols },
          { row: rows - 1, col: cols - 1 }
        )
      ).toBe(1); // even rows has 1 less column

      expect(
        calculateHexDistance(
          getBattlefieldDimensions(size),
          { row: rows, col: cols },
          { row: rows - 1, col: cols - 2 }
        )
      ).toBe(2); // even rows has 1 less column
      expect(
        calculateHexDistance(
          getBattlefieldDimensions(size),
          { row: rows, col: cols },
          { row: rows, col: cols - 2 }
        )
      ).toBe(2);
      expect(
        calculateHexDistance(
          getBattlefieldDimensions(size),
          { row: rows, col: cols },
          { row: rows - 2, col: cols }
        )
      ).toBe(2);

      expect(
        calculateHexDistance(
          getBattlefieldDimensions(size),
          { row: rows, col: cols },
          { row: rows - 1, col: cols }
        )
      ).toBe(-1); // the second position is not exists since on even rows there is 1 less column
    });

    it('should calculate distance between two hexagonal coordinates. Middle', () => {
      const size = 'huge';
      let { rows, cols } = getBattlefieldDimensions(size);
      expect(
        calculateHexDistance(
          { rows: rows, cols: cols },
          { row: 0, col: 0 },
          { row: rows - 1, col: cols - 1 }
        )
      ).toBe(37);

      expect(
        calculateHexDistance({ rows: rows, cols: cols }, { row: 3, col: 6 }, { row: 5, col: 11 })
      ).toBe(6);
    });

    it('should calculate distance between two hexagonal coordinates. Not-Exists', () => {
      const size = 'huge';
      let { rows, cols } = getBattlefieldDimensions(size);
      expect(
        calculateHexDistance(
          { rows: rows, cols: cols },
          { row: rows - 1, col: cols - 1 },
          { row: rows, col: cols }
        )
      ).toBe(-1);
    });
  });
});
