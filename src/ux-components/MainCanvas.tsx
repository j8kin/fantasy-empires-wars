import React, { useState } from 'react';
import styles from './css/Background.module.css';
import BorderSystem from './BorderSystem';
import ManaPanel, { MapSize } from './ManaPanel';
import MainMap from './MainMap';

const MainCanvas: React.FC = () => {
  const [mapSize, setMapSize] = useState<MapSize>('medium');

  return (
    <div
      className={styles.backgroundStyle}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden', // Prevent any scrolling
      }}
      id="MainCanvas"
    >
      {/* Separate border system from content */}
      <BorderSystem />

      {/* Content components */}
      <ManaPanel mapSize={mapSize} onMapSizeChange={setMapSize} />
      <MainMap mapSize={mapSize} />
    </div>
  );
};

export default MainCanvas;
