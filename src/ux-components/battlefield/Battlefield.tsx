import React from 'react';
import styles from './css/Battlefield.module.css';
import hexStyles from './css/Hexagonal.module.css';

import { useGameContext } from '../../contexts/GameContext';

import LandTile from './LandTile';
import FantasyBorderFrame, { FrameSize } from '../fantasy-border-frame/FantasyBorderFrame';
import { battlefieldLandId, getTurnOwner } from '../../types/GameState';

export interface BattlefieldProps {
  topPanelHeight: number;
  tileSize: FrameSize;
}

// todo refactor and remove the same size should be used + scroll map
const getHexTileSize = (battlefieldCols: number): FrameSize => {
  // Base size for small map, decrease as map size increases
  const baseWidth = 100;
  let scaleFactor: number;

  switch (battlefieldCols) {
    case 13:
      scaleFactor = 1.4; // Largest tiles for smallest map
      break;
    case 18:
      scaleFactor = 1.0; // Smallest tiles for medium map (has most tiles)
      break;
    case 23:
      scaleFactor = 0.8; // Medium size tiles
      break;
    case 31:
      scaleFactor = 0.6; // Smaller tiles for huge map
      break;
    default:
      scaleFactor = 1.0;
  }

  const width = baseWidth * scaleFactor;
  const height = width * 1.1547; // Height = width * sqrt(3) for pointy-topped hexagon

  return { width, height };
};

const Battlefield: React.FC<BattlefieldProps> = ({ topPanelHeight, tileSize }) => {
  const { gameState } = useGameContext();

  // Battlefield generated at application startup, but gameState is not initialized yet - use dummy map size todo: refactor
  const { rows, cols } = gameState?.battlefield.dimensions || { rows: 1, cols: 1 };
  const { width: tileWidth, height: tileHeight } = getHexTileSize(cols);
  const hexGrid = [];

  // Loop to generate rows and columns of hex tiles using map state
  for (let row = 0; row < rows; row++) {
    const hexRow = [];
    // For even rows, we might want fewer columns to maintain the pattern
    const colsInThisRow = row % 2 === 0 ? cols : cols - 1;

    for (let col = 0; col < colsInThisRow; col++) {
      const mapPosition = { row: row, col: col };
      const tileId = battlefieldLandId(mapPosition);

      hexRow.push(<LandTile key={tileId} battlefieldPosition={mapPosition} />);
    }

    hexGrid.push(
      <div className={hexStyles['hex-row']} key={`row-${row}`}>
        {hexRow}
      </div>
    );
  }

  return (
    <FantasyBorderFrame
      screenPosition={{ x: 0, y: topPanelHeight }}
      frameSize={{ width: window.innerWidth, height: window.innerHeight - topPanelHeight }}
      tileDimensions={tileSize}
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
        {/* Draw map if game started */}
        {getTurnOwner(gameState) && <div>{hexGrid}</div>}
      </div>
    </FantasyBorderFrame>
  );
};
export default Battlefield;
