import React from 'react';
import { Dimensions } from 'react-native';
import styles from './css/MainMap.module.css';
import HexTile from './HexTile';

const MainMap: React.FC = () => {
  const height = Dimensions.get('window').height - 200;
  const width = Dimensions.get('window').width - 100;

  const rows = 6; // Number of rows
  const cols = 6; // Number of columns
  const hexGrid = [];

  // Loop to generate rows and columns of hex tiles
  for (let row = 0; row < rows; row++) {
    const hexRow = [];
    for (let col = 0; col < cols; col++) {
      hexRow.push(<HexTile key={`${row}-${col}`} />);
    }
    hexGrid.push(
      <div className="hex-row" key={`row-${row}`}>
        {hexRow}
      </div>
    );
  }

  return (
    <div
      id="MainMap"
      className={styles.mapContainer}
      style={{
        height: height,
        width: width,
      }}
    >
      {/* Add content or placeholders for map elements */}
      {/*<p>Main Map will be implemented here.</p>*/}
      <div className="main-map">{hexGrid}</div>
    </div>
  );
};
export default MainMap;
