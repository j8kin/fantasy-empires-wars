import React from 'react';
import { Dimensions } from 'react-native';
import Table from 'react-bootstrap/Table';
import ManaVial from './ManaVial';
import CelticPatternCorner from '../assets/images/CelticPatternCorner.png'; // Import the image
import CelticPatternVertical from '../assets/images/CelticPatternVertical.png'; // Import the image
const ManaPanel = () => {
  const frameWidth = Dimensions.get('window').width; // Example frame width in pixels
  const tileWidth = 181; // Width of the HorizontalSide image in pixels
  const numTiles = Math.ceil(frameWidth / tileWidth); // Calculate the number of tiles needed

  return (
    <div style={frameContainerStyle}>
      {/* Top Horizontal Sides */}
      {Array.from({ length: numTiles }).map((_, index) => (
        <img
          key={index}
          src={CelticPatternVertical}
          alt="Horizontal Side"
          style={{
            ...horizontalTileStyle,
            left: index * tileWidth, // Dynamically position each tile
          }}
        />
      ))}

      {/* Top Corners */}
      <img
        src={CelticPatternCorner}
        alt="Top Left Corner"
        style={{...cornerStyle, ...topLeftStyle}}
        onError={(e) => {
          e.currentTarget.src = '/assets/images/fallback.png'; // Fallback image
          e.currentTarget.alt = 'Fallback Image';
        }}
      />
      <img
        src={CelticPatternCorner}
        alt="Top Right Corner"
        style={{...cornerStyle, ...topRightStyle}}
        onError={(e) => {
          e.currentTarget.src = '/assets/images/fallback.png'; // Fallback image
          e.currentTarget.alt = 'Fallback Image';
        }}
      />
      {/* Vertical Sides */}
      <img
        src={CelticPatternVertical}
        alt="Left Vertical"
        style={{...verticalStyle, ...leftStyle}}
      />
      <img
        src={CelticPatternVertical}
        alt="Right Vertical"
        style={{...verticalStyle, ...rightStyle}}
      />

      {/* Mana Vials */}
      <div style={manaVialsContainerStyle}>
        <ManaVial color="black" percentage={75} />
        <ManaVial color="white" percentage={50} />
        <ManaVial color="blue" percentage={100} />
        <ManaVial color="green" percentage={25} />
        <ManaVial color="red" percentage={5} />
      </div>

      {/* Bottom Corners */}
      <img
        src={CelticPatternCorner}
        alt="Bottom Left Corner"
        style={{...cornerStyle, ...bottomLeftStyle}}
      />
      <img
        src={CelticPatternCorner}
        alt="Bottom Right Corner"
        style={{...cornerStyle, ...bottomRightStyle}}
      />
    </div>
  );
};

// Define styles
const frameContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 'auto',
  padding: '20px',
  boxSizing: 'border-box',
};

const manaVialsContainerStyle: React.CSSProperties = {
  display: 'flex', // Use flexbox to align items in a row
  justifyContent: 'center', // Center the ManaVials horizontally
  alignItems: 'center', // Center the ManaVials vertically (optional)
  gap: '10px', // Add spacing between ManaVials
  padding: '20px', // Add padding around the container
};

const contentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  padding: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
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

const topHorizontalContainerStyle: React.CSSProperties = {
  display: 'flex', // Use flexbox to align items in a row
  justifyContent: 'center', // Center the ManaVials horizontally
  alignItems: 'center', // Center the ManaVials vertically (optional)
  //gap: '10px', // Add spacing between ManaVials
  //padding: '20px', // Add padding around the container
  zIndex: 2, // Ensure it is below the corners but above other elements
};

const horizontalTileStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-68px', // Align the tiles at the top
  width: '50px', // Match the width of the image
  height: '100%', // Match the height of the image
  zIndex: 2, // Ensure it is below the corners but above other elements
  transform: 'rotate(90deg)',
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
