import React from 'react';
import styles from './css/Battlefield.module.css';
import hexStyles from './css/Hexagonal.module.css';

import { useGameContext } from '../../contexts/GameContext';

import LandTile from './LandTile';
import FantasyBorderFrame, { FrameSize } from '../fantasy-border-frame/FantasyBorderFrame';
import { BattlefieldDimensions, battlefieldLandId, getTurnOwner } from '../../types/GameState';

export interface BattlefieldProps {
  topPanelHeight: number;
  tileSize: FrameSize;
}

const getHexTileSize = (
  battlefieldDimensions: BattlefieldDimensions,
  availableArea: FrameSize
): FrameSize => {
  const defaultWidth = 100;
  const hexRatio = 1.1547; // sqrt(3) for pointy-topped hexagon

  // Calculate width based on available horizontal space
  // Account for hex row offset (even rows are offset by 0.5 tile width) and some padding
  const effectiveCols = battlefieldDimensions.cols + 0.5; // Add 0.5 for the offset
  const calculatedWidthFromArea = (availableArea.width - 100) / effectiveCols; // 40px for padding

  // Calculate width based on available vertical space
  // Account for row overlap (rows overlap by 25% of tile height)
  const effectiveRows = battlefieldDimensions.rows + 0.25; // Overlap calculation
  const availableHeightPerRow = (availableArea.height - 100) / effectiveRows; // 40px for padding
  const calculatedWidthFromHeight = availableHeightPerRow / hexRatio;

  // Use the maximum of default width and calculated widths for better scaling
  const width = Math.max(defaultWidth, calculatedWidthFromArea, calculatedWidthFromHeight);
  const height = width * hexRatio;

  return { width, height };
};

const Battlefield: React.FC<BattlefieldProps> = ({ topPanelHeight, tileSize }) => {
  const { gameState } = useGameContext();

  // Battlefield generated at application startup, but gameState is not initialized yet - use dummy map size
  const { rows, cols } = gameState?.battlefield.dimensions || { rows: 1, cols: 1 };
  const availableArea = {
    width: window.innerWidth,
    height: window.innerHeight - topPanelHeight,
  };

  const hexGrid = [];
  const { width: tileWidth, height: tileHeight } = getHexTileSize({ rows, cols }, availableArea);

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
            // CSS custom properties for dynamic tile sizing
            '--hex-tile-width': `${tileWidth}px`,
            '--hex-tile-height': `${tileHeight}px`,
            '--hex-row-margin': `${-tileHeight * 0.25}px`, // Overlap rows
            '--hex-row-offset': `${tileWidth * 0.5}px`, // Offset even rows
          } as React.CSSProperties
        }
      >
        {/* Draw map if game started */}
        {getTurnOwner(gameState) && <div className={styles.battlefieldContent}>{hexGrid}</div>}
      </div>
    </FantasyBorderFrame>
  );
};
export default Battlefield;
