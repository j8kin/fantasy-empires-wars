import React from 'react';
import styles from './Background.module.css';
import BorderVerticalCanvas from './BorderVerticalCanvas';
import BorderHorizontalCanvas from './BorderHorizontalCanvas';
import BorderCornerCanvas from './BorderCornerCanvas';
import ManaPanel from './ManaPanel';
import MainMap from './MainMap';

const MainCanvas: React.FC = () => {
  return (
    <div
      className={styles.backgroundStyle}
      style={{ width: '100vw', height: '100vh' }}
      id="MainCanvas"
    >
      {/* Add BorderCanvas to all sides */}
      <BorderVerticalCanvas isLeft={true} />
      <BorderVerticalCanvas isLeft={false} />
      <BorderHorizontalCanvas isTop={true} />
      <BorderHorizontalCanvas isTop={false} />
      <BorderCornerCanvas isTopCorner={true} isLeftCorner={true} />
      <BorderCornerCanvas isTopCorner={true} isLeftCorner={false} />
      <BorderCornerCanvas isTopCorner={false} isLeftCorner={true} />
      <BorderCornerCanvas isTopCorner={false} isLeftCorner={false} />

      {/* Add ManaPanel */}
      <ManaPanel />

      {/* Add MainMap */}
      <MainMap />
    </div>
  );
};

export default MainCanvas;
