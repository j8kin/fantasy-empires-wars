import React, { useEffect } from 'react';
import styles from './css/Battlefield.module.css';
import HexTile from './HexTile';
import hexStyles from './css/Hexagonal.module.css';
import { BattlefieldSize, getBattlefieldDimensions } from '../../types/BattlefieldSize';
import { useMapState } from '../../hooks/useMapState';
import { createTileId } from '../../types/HexTileState';
import FantasyBorderFrame, { BorderTileSize } from '../fantasy-border-frame/FantasyBorderFrame';

interface BattlefieldProps {
  top: number;
  tileSize: BorderTileSize;
  battlefieldSize: BattlefieldSize;
}

const getHexTileSize = (battlefieldSize: BattlefieldSize): { width: number; height: number } => {
  // Base size for small map, decrease as map size increases
  const baseWidth = 100;
  let scaleFactor: number;

  switch (battlefieldSize) {
    case 'small':
      scaleFactor = 1.4; // Largest tiles for smallest map
      break;
    case 'medium':
      scaleFactor = 1.0; // Smallest tiles for medium map (has most tiles)
      break;
    case 'large':
      scaleFactor = 0.8; // Medium size tiles
      break;
    case 'huge':
      scaleFactor = 0.6; // Smaller tiles for huge map
      break;
    default:
      scaleFactor = 1.0;
  }

  const width = baseWidth * scaleFactor;
  const height = width * 1.1547; // Height = width * sqrt(3) for pointy-topped hexagon

  return { width, height };
};

const Battlefield: React.FC<BattlefieldProps> = ({ top, tileSize, battlefieldSize }) => {
  const { mapState, changeBattlefieldSize } = useMapState(battlefieldSize);

  useEffect(() => {
    if (mapState.mapSize !== battlefieldSize) {
      changeBattlefieldSize(battlefieldSize);
    }
  }, [battlefieldSize, mapState.mapSize, changeBattlefieldSize]);

  const { rows, cols } = getBattlefieldDimensions(battlefieldSize);
  const { width: tileWidth, height: tileHeight } = getHexTileSize(battlefieldSize);
  const hexGrid = [];

  // Loop to generate rows and columns of hex tiles using map state
  for (let row = 0; row < rows; row++) {
    const hexRow = [];
    // For even rows, we might want fewer columns to maintain the pattern
    const colsInThisRow = row % 2 === 0 ? cols : cols - 1;

    for (let col = 0; col < colsInThisRow; col++) {
      const tileId = createTileId(row, col);
      const tileState = mapState.tiles[tileId];

      hexRow.push(<HexTile key={tileId} landType={tileState?.landType} tileState={tileState} />);
    }

    hexGrid.push(
      <div className={hexStyles['hex-row']} key={`row-${row}`}>
        {hexRow}
      </div>
    );
  }

  return (
    <FantasyBorderFrame
      x={0}
      y={top}
      width={window.innerWidth}
      height={window.innerHeight - top}
      tileSize={tileSize}
      accessible={true}
      zIndex={90}
    >
      <div
        id="Battlefield"
        data-testid="Battlefield"
        className={styles.mapContainer}
        style={
          {
            width: '100%',
            height: '100%',
            overflow: 'hidden', // Prevent content from spilling out
            boxSizing: 'border-box',
            // CSS custom properties for dynamic tile sizing
            '--hex-tile-width': `${tileWidth}px`,
            '--hex-tile-height': `${tileHeight}px`,
            '--hex-row-margin': `${-tileHeight * 0.25}px`, // Overlap rows
            '--hex-row-offset': `${tileWidth * 0.5}px`, // Offset even rows
          } as React.CSSProperties
        }
      >
        {/* Add content or placeholders for map elements */}
        {/*<p>Main Map will be implemented here.</p>*/}
        <div>{hexGrid}</div>
      </div>
    </FantasyBorderFrame>
  );
};
export default Battlefield;
