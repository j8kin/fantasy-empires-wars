import React from 'react';
import { Dimensions } from 'react-native';

import ManaVial from './ManaVial';
import ManaPanelCorner from './ManaPanelCorner';
import ManaPanelTile from './ManaPanelTile';

import CelticPatternCorner from '../assets/images/CelticPatternCorner.png';
import CelticPatternVertical from '../assets/images/CelticPatternVertical.png';

import styles from './Background.module.css';

const ManaPanel: React.FC = () => {
  const frameWidth = Dimensions.get('window').width;
  const tileWidth = 181;
  const numTiles = Math.ceil(frameWidth / tileWidth);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/assets/images/fallback.png';
    e.currentTarget.alt = 'Fallback Image';
  };

  return (
    <div style={frameContainerStyle} id="ManaPanel">
      {Array.from({ length: numTiles }).map((_, index) => {
        const leftPosition = index * tileWidth;

        return (
          <React.Fragment key={index}>
            <ManaPanelTile
              src={CelticPatternVertical}
              alt="Horizontal Side Top"
              style={{
                ...horizontalTileStyle,
                ...horizontalTopTileStyle,
                left: leftPosition,
              }}
            />
            <ManaPanelTile
              src={CelticPatternVertical}
              alt="Horizontal Side Bottom"
              style={{
                ...horizontalTileStyle,
                ...horizontalBottomTileStyle,
                left: leftPosition,
              }}
            />
          </React.Fragment>
        );
      })}
      <ManaPanelCorner
        src={CelticPatternCorner}
        alt="Top Left Corner"
        style={{ ...cornerStyle, ...topLeftStyle }}
        onError={handleImageError}
      />
      <ManaPanelCorner
        src={CelticPatternCorner}
        alt="Top Right Corner"
        style={{ ...cornerStyle, ...topRightStyle }}
        onError={handleImageError}
      />
      <ManaPanelTile
        src={CelticPatternVertical}
        alt="Left Vertical"
        style={{ ...verticalStyle, ...leftStyle }}
      />
      <ManaPanelTile
        src={CelticPatternVertical}
        alt="Right Vertical"
        style={{ ...verticalStyle, ...rightStyle }}
      />
      <div className={styles.backgroundStyle} style={vialPanelStyle}>
        <ManaVial color="black" percentage={75} />
        <ManaVial color="white" percentage={50} />
        <ManaVial color="blue" percentage={100} />
        <ManaVial color="green" percentage={25} />
        <ManaVial color="red" percentage={5} />
      </div>
      <ManaPanelCorner
        src={CelticPatternCorner}
        alt="Bottom Left Corner"
        style={{ ...cornerStyle, ...bottomLeftStyle }}
      />
      <ManaPanelCorner
        src={CelticPatternCorner}
        alt="Bottom Right Corner"
        style={{ ...cornerStyle, ...bottomRightStyle }}
      />
    </div>
  );
};

// Define styles
const frameContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '200px',
  boxSizing: 'border-box',
};
const vialPanelStyle: React.CSSProperties = {
  gap: '20px', // Add spacing between ManaVials
  padding: '55px', // Add padding around the container
};

const cornerStyle: React.CSSProperties = {
  position: 'absolute',
  width: '50px',
  height: '50px',
  zIndex: 3, // Ensure corners are above vertical images
};
const topLeftStyle: React.CSSProperties = {
  top: 0,
  left: 0,
};
const topRightStyle: React.CSSProperties = {
  top: 0,
  right: 0,
};
const bottomLeftStyle: React.CSSProperties = {
  bottom: 0,
  left: 0,
  transform: 'rotate(270deg)', // Rotate for correct orientation
};

const bottomRightStyle: React.CSSProperties = {
  bottom: 0,
  right: 0,
  transform: 'rotate(180deg)', // Rotate for correct orientation
};
const horizontalTileStyle: React.CSSProperties = {
  position: 'absolute',
  width: '50px', // Match the width of the image
  height: '100%', // Match the height of the image
  zIndex: 2, // Ensure it is below the corners but above other elements
  transform: 'rotate(90deg)',
};
const horizontalTopTileStyle: React.CSSProperties = {
  top: '-75px', // Align the tiles at the top
};

const horizontalBottomTileStyle: React.CSSProperties = {
  top: '75px', // Align the tiles at the top
};

const verticalStyle: React.CSSProperties = {
  position: 'absolute',
  width: '50px', // Adjust size as needed
  height: '100%',
  zIndex: 2, // Ensure vertical images are below corners
};

const leftStyle: React.CSSProperties = {
  top: 0,
  left: 0,
};

const rightStyle: React.CSSProperties = {
  top: 0,
  right: 0,
};

export default ManaPanel;
