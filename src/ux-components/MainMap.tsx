import React from 'react';
import { LAYOUT_CONSTANTS } from './BorderSystem';
import styles from './css/MainMap.module.css';
import HexTile from './HexTile';
import hexStyles from './css/Hexagonal.module.css';
import { MapSize } from './ManaPanel';

interface MainMapProps {
  mapSize: MapSize;
}

const getMapDimensions = (mapSize: MapSize): { rows: number; cols: number } => {
  switch (mapSize) {
    case 'small':
      return { rows: 6, cols: 13 };
    case 'medium':
      return { rows: 9, cols: 18 };
    case 'large':
      return { rows: 11, cols: 23 };
    case 'huge':
      return { rows: 15, cols: 31 };
    default:
      return { rows: 9, cols: 18 };
  }
};

const getHexTileSize = (mapSize: MapSize): { width: number; height: number } => {
  // Base size for small map, decrease as map size increases
  const baseWidth = 100;
  let scaleFactor: number;

  switch (mapSize) {
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

const MainMap: React.FC<MainMapProps> = ({ mapSize }) => {
  // Calculate dimensions to fit within borders and below ManaPanel
  const topPosition = LAYOUT_CONSTANTS.MANA_PANEL_BOTTOM_Y + LAYOUT_CONSTANTS.BORDER_WIDTH;
  const leftPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;
  const rightPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;
  const bottomPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;

  const { rows, cols } = getMapDimensions(mapSize);
  const { width: tileWidth, height: tileHeight } = getHexTileSize(mapSize);
  const hexGrid = [];

  // Loop to generate rows and columns of hex tiles
  for (let row = 0; row < rows; row++) {
    const hexRow = [];
    // For even rows, we might want fewer columns to maintain the pattern
    const colsInThisRow = row % 2 === 0 ? cols : cols - 1;

    for (let col = 0; col < colsInThisRow; col++) {
      hexRow.push(<HexTile key={`${row}-${col}`} />);
    }

    hexGrid.push(
      <div className={hexStyles['hex-row']} key={`row-${row}`}>
        {hexRow}
      </div>
    );
  }

  return (
    <div
      id="MainMap"
      className={styles.mapContainer}
      style={
        {
          position: 'absolute',
          top: topPosition,
          left: leftPosition,
          right: rightPosition,
          bottom: bottomPosition,
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
      <div className="main-map">{hexGrid}</div>
    </div>
  );
};
export default MainMap;
