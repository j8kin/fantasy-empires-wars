import React from 'react';
import BorderCorner from './BorderCorner';
import BorderHorizontal from './BorderHorizontal';
import BorderVertical from './BorderVertical';
import styles from './css/DialogTemplate.module.css';

export interface BorderTileSize {
  width: number;
  height: number;
}

export interface DialogTemplateProps {
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
  primaryButton?: React.ReactElement;
  secondaryButton?: React.ReactElement;
  tileSize?: BorderTileSize;
}

// 50*180 since base tile is vertical
const defaultTileSize: BorderTileSize = {
  width: 50,
  height: 180,
};
const cornerSize = (tileSize: BorderTileSize): number => Math.min(tileSize.width, tileSize.height);

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
        <BorderCorner position="top-left" size={cornerSize(tileSize)} />
        <BorderCorner position="top-right" size={cornerSize(tileSize)} />
        <BorderCorner position="bottom-left" size={cornerSize(tileSize)} />
        <BorderCorner position="bottom-right" size={cornerSize(tileSize)} />

        {/* Horizontal border */}
        <BorderHorizontal side="top" tileSize={tileSize} length={width} />
        <BorderHorizontal side="bottom" tileSize={tileSize} length={width} />

        {/* Vertical border */}
        <BorderVertical side="left" tileSize={tileSize} length={height} />
        <BorderVertical side="right" tileSize={tileSize} length={height} />

        {/* Dialog content area */}
        <div
          style={{
            position: 'absolute',
            left: cornerSize(tileSize),
            top: cornerSize(tileSize),
            width: width - cornerSize(tileSize) * 2,
            height: height - cornerSize(tileSize) * 2,
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
              left: cornerSize(tileSize),
              bottom: 0,
              width: width - cornerSize(tileSize) * 2,
              height: Math.min(Math.min(tileSize.height, tileSize.width), 60),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              zIndex: 1002,
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
