import React from 'react';
import { Dimensions } from 'react-native';
import styles from './MainMap.module.css';

const MainMap: React.FC = () => {
  const height = Dimensions.get('window').height - 200;
  const width = Dimensions.get('window').width - 100;

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
      <p>Main Map will be implemented here.</p>
    </div>
  );
};

export default MainMap;
