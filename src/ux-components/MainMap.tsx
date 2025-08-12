import React from 'react';
import { LAYOUT_CONSTANTS } from './BorderSystem';
import styles from './css/MainMap.module.css';
import HexTile from './HexTile';
import hexStyles from './css/Hexagonal.module.css';

const MainMap: React.FC = () => {
  // Calculate dimensions to fit within borders and below ManaPanel
  const topPosition = LAYOUT_CONSTANTS.MANA_PANEL_BOTTOM_Y + LAYOUT_CONSTANTS.BORDER_WIDTH;
  const leftPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;
  const rightPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;
  const bottomPosition = LAYOUT_CONSTANTS.BORDER_WIDTH;

  const rows = 8; // Increased number of rows for better visualization
  const cols = 8; // Increased number of columns for better visualization
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