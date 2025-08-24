import React, { useState } from 'react';
import styles from './css/Background.module.css';
import BorderSystem, { LAYOUT_CONSTANTS } from './BorderSystem';
import ManaPanel, { MapSize } from './ManaPanel';
import MainMap from './MainMap';
import EndOfTurnButton from './EndOfTurnButton';

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

      {/* End of Turn Button positioned in middle of second horizontal canvas */}
      <EndOfTurnButton
        style={{
          left: '50%',
          top: `${LAYOUT_CONSTANTS.MANA_PANEL_BOTTOM_Y+LAYOUT_CONSTANTS.BORDER_WIDTH/2}px`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={() => {
          console.log('End turn clicked');
        }}
      />
    </div>
  );
};

export default MainCanvas;
