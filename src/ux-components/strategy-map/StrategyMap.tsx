import React from 'react';
import styles from './css/StrategyMap.module.css';
import hexStyles from './css/Hexagonal.module.css';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import LandTile from './LandTile';

import { useGameContext } from '../../contexts/GameContext';
import { getLandId } from '../../state/map/land/LandId';
import type { MapDimensions } from '../../state/map/MapDimensions';
import type { FrameSize } from '../../contexts/ApplicationContext';

export interface StrategyMapProps {
  topPanelHeight: number;
  tileSize: FrameSize;
}

const getHexTileSize = (strategyMapDimensions: MapDimensions, availableArea: FrameSize): FrameSize => {
  const defaultWidth = 100;
  const hexRatio = 1.1547; // sqrt(3) for pointy-topped hexagon

  // Calculate width based on available horizontal space
  // Account for hex row offset (even rows are offset by 0.5 tile width) and some padding
  const effectiveCols = strategyMapDimensions.cols + 0.5; // Add 0.5 for the offset
  const calculatedWidthFromArea = (availableArea.width - 100) / effectiveCols; // 40px for padding

  // Calculate width based on available vertical space
  // Account for row overlap (rows overlap by 25% of tile height)
  const effectiveRows = strategyMapDimensions.rows + 0.25; // Overlap calculation
  const availableHeightPerRow = (availableArea.height - 100) / effectiveRows; // 40px for padding
  const calculatedWidthFromHeight = availableHeightPerRow / hexRatio;

  // Use the maximum of default width and calculated widths for better scaling
  const width = Math.max(defaultWidth, calculatedWidthFromArea, calculatedWidthFromHeight);
  const height = width * hexRatio;

  return { width, height };
};

const StrategyMap: React.FC<StrategyMapProps> = ({ topPanelHeight, tileSize }) => {
  const { gameState } = useGameContext();

  // StrategyMap generated at application startup, but gameState is not initialized yet - use dummy map size
  const { rows, cols } = gameState?.map.dimensions || { rows: 1, cols: 1 };
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
      const tileId = getLandId(mapPosition);

      hexRow.push(<LandTile key={tileId} mapPosition={mapPosition} />);
    }

    hexGrid.push(
      <div className={hexStyles['hex-row']} data-testid="hex-row" key={`row-${row}`}>
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
        id="StrategyMap"
        data-testid="StrategyMap"
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
        {gameState?.turnOwner && <div className={styles.battlefieldContent}>{hexGrid}</div>}
      </div>
    </FantasyBorderFrame>
  );
};
export default StrategyMap;
