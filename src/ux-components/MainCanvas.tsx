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
      <BorderCornerCanvas isTop={true} isLeft={true} />
      <BorderCornerCanvas isTop={true} isLeft={false} />
      <BorderCornerCanvas isTop={false} isLeft={true} />
      <BorderCornerCanvas isTop={false} isLeft={false} />

      {/* Add ManaPanel */}
      <ManaPanel />
      {/* Add Split ManaPanel and MainMap with Border */}
      <BorderHorizontalCanvas isTop={true} topOffset={145} />
      <BorderCornerCanvas isTop={true} isLeft={true} topOffset={145} />
      <BorderCornerCanvas isTop={true} isLeft={false} topOffset={145} />

      {/* Add MainMap */}
      <MainMap />
    </div>
  );
};

export default MainCanvas;
