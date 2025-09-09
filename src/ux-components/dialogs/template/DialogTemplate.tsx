import React from 'react';
import CelticPatternVertical from '../../../assets/border/CelticPatternVertical.png';
import CelticPatternCorner from '../../../assets/border/CelticPatternCorner.png';
import styles from './css/DialogTemplate.module.css';

export interface DialogTileSize {
  vertical: { width: number; height: number };
  horizontal: { width: number; height: number };
  corner: { width: number; height: number };
}

export interface DialogTemplateProps {
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
  primaryButton?: React.ReactElement;
  secondaryButton?: React.ReactElement;
  tileSize?: DialogTileSize;
}

const defaultTileSize: DialogTileSize = {
  vertical: { width: 50, height: 180 },
  horizontal: { width: 180, height: 50 },
  corner: { width: 50, height: 50 },
};

const DialogTemplate: React.FC<DialogTemplateProps> = ({
  x,
  y,
  width,
  height,
  children,
  primaryButton,
  secondaryButton,
  tileSize = defaultTileSize,
}) => {
  const { vertical, horizontal, corner } = tileSize;

  // Calculate number of tiles needed
  const numVerticalTiles = Math.ceil((height - corner.height * 2) / vertical.height);
  const numHorizontalTiles = Math.ceil((width - corner.width * 2) / vertical.height);

  // Calculate inner content area
  const contentX = corner.width;
  const contentY = corner.height;
  const contentWidth = width - corner.width * 2;
  const contentHeight = height - corner.height * 2 - Math.max(vertical.width, 60); // Reserve space for bottom buttons (min 60px for button visibility)

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          pointerEvents: 'auto',
        }}
      />
      {/* Dialog */}
      <div
        style={{
          position: 'fixed',
          left: x,
          top: y,
          width,
          height,
          pointerEvents: 'auto',
          zIndex: 1000,
        }}
      >
        {/* Corner ornaments */}
        <img
          src={CelticPatternCorner}
          alt="Top Left Corner"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: corner.width,
            height: corner.height,
          }}
        />
        <img
          src={CelticPatternCorner}
          alt="Top Right Corner"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: corner.width,
            height: corner.height,
            transform: 'rotate(90deg)',
          }}
        />
        <img
          src={CelticPatternCorner}
          alt="Bottom Left Corner"
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: corner.width,
            height: corner.height,
            transform: 'rotate(270deg)',
          }}
        />
        <img
          src={CelticPatternCorner}
          alt="Bottom Right Corner"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: corner.width,
            height: corner.height,
            transform: 'rotate(180deg)',
          }}
        />

        {/* Top horizontal border */}
        {Array.from({ length: numHorizontalTiles }).map((_, index) => (
          <img
            key={`top-${index}`}
            src={CelticPatternVertical}
            alt="Top Border"
            style={{
              position: 'absolute',
              left: corner.width + index * vertical.height,
              top: 0,
              width: vertical.height,
              height: vertical.width,
              transform: 'rotate(90deg)',
              transformOrigin: 'center',
            }}
          />
        ))}

        {/* Bottom horizontal border */}
        {Array.from({ length: numHorizontalTiles }).map((_, index) => (
          <img
            key={`bottom-${index}`}
            src={CelticPatternVertical}
            alt="Bottom Border"
            style={{
              position: 'absolute',
              left: corner.width + index * vertical.height,
              bottom: 0,
              width: vertical.height,
              height: vertical.width,
              transform: 'rotate(270deg)',
              transformOrigin: 'center',
            }}
          />
        ))}

        {/* Left vertical border */}
        {Array.from({ length: numVerticalTiles }).map((_, index) => (
          <img
            key={`left-${index}`}
            src={CelticPatternVertical}
            alt="Left Border"
            style={{
              position: 'absolute',
              left: 0,
              top: corner.height + index * vertical.height,
              width: vertical.width,
              height: vertical.height,
            }}
          />
        ))}

        {/* Right vertical border */}
        {Array.from({ length: numVerticalTiles }).map((_, index) => (
          <img
            key={`right-${index}`}
            src={CelticPatternVertical}
            alt="Right Border"
            style={{
              position: 'absolute',
              right: 0,
              top: corner.height + index * vertical.height,
              width: vertical.width,
              height: vertical.height,
              transform: 'rotate(180deg)',
              transformOrigin: 'center',
            }}
          />
        ))}

        {/* Dialog content area */}
        <div
          style={{
            position: 'absolute',
            left: contentX,
            top: contentY,
            width: contentWidth,
            height: contentHeight,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>

        {/* Button area on bottom border */}
        {(primaryButton || secondaryButton) && (
          <div
            style={{
              position: 'absolute',
              left: contentX,
              bottom: 0,
              width: contentWidth,
              height: Math.max(vertical.width, 60),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              zIndex: 1001,
            }}
          >
            {primaryButton && <div className={styles.buttonContainer}>{primaryButton}</div>}
            {secondaryButton && <div className={styles.buttonContainer}>{secondaryButton}</div>}
          </div>
        )}
      </div>
    </>
  );
};

export default DialogTemplate;
