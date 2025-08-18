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
      return { rows: 4, cols: 4 };
    case 'medium':
      return { rows: 9, cols: 18 };
    case 'large':
      return { rows: 8, cols: 8 };
    case 'huge':
      return { rows: 12, cols: 12 };
    default:
      return { rows: 6, cols: 6 };
  }
};

const MainMap: React.FC<MainMapProps> = ({ mapSize }) => {
  // Calculate dimensions to fit within borders and below ManaPanel
  const topPosition = LAYOUT_CONSTANTS.MANA_PANEL_BOTTOM_Y + LAYOUT_CONSTANTS.BORDER_WIDTH;
  const leftPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;
  const rightPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;
  const bottomPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;

  const { rows, cols } = getMapDimensions(mapSize);
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
      <div className={hexStyles["hex-row"]} key={`row-${row}`}>
        {hexRow}
      </div>
    );
  }

  return (
    <div
      id="MainMap"
      className={styles.mapContainer}
      style={{
        position: 'absolute',
        top: topPosition,
        left: leftPosition,
        right: rightPosition,
        bottom: bottomPosition,
        overflow: 'hidden', // Prevent content from spilling out
        boxSizing: 'border-box',
      }}
    >
      {/* Add content or placeholders for map elements */}
      {/*<p>Main Map will be implemented here.</p>*/}
      <div className="main-map">{hexGrid}</div>
    </div>
  );
};
export default MainMap;