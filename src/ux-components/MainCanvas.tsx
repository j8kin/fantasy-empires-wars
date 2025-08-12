import React from 'react';
import styles from './css/Background.module.css';
import BorderSystem from './BorderSystem';
import ManaPanel from './ManaPanel';
import MainMap from './MainMap';

const MainCanvas: React.FC = () => {
  return (
    <div
      className={styles.backgroundStyle}
      style={{ width: '100vw', height: '100vh', position: 'relative' }}
      id="MainCanvas"
    >
      {/* Separate border system from content */}
      <BorderSystem />
      
      {/* Content components */}
      <ManaPanel />
      <MainMap />
    </div>
  );
};

export default MainCanvas;
