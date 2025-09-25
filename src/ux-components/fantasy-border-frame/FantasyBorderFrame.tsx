import React from 'react';
import CornerBorder from './CornerBorder';
import HorizontalBorder from './HorizontalBorder';
import VerticalBorder from './VerticalBorder';

export interface BorderTileSize {
  width: number;
  height: number;
}

/**
 * Top Left position of the window/dialog/popup
 */
export interface ScreenPosition {
  x: number;
  y: number;
}

export interface FantasyBorderFrameProps {
  screenPosition: ScreenPosition;
  dimensions: BorderTileSize;
  children: React.ReactNode;
  primaryButton?: React.ReactElement;
  secondaryButton?: React.ReactElement;
  tileSize?: BorderTileSize;
  zIndex?: number;
  accessible?: boolean;
  flexibleSizing?: boolean;
}

// 50*180 since base tile is vertical
export const defaultTileSize: BorderTileSize = {
  width: 50,
  height: 180,
};
const cornerSize = (tileSize: BorderTileSize): number => Math.min(tileSize.width, tileSize.height);

const FantasyBorderFrame: React.FC<FantasyBorderFrameProps> = ({
  screenPosition,
  dimensions,
  children,
  primaryButton,
  secondaryButton,
  tileSize = defaultTileSize,
  zIndex = 1000,
  accessible = false,
  flexibleSizing = false,
}) => {
  const { x, y } = screenPosition;
  const { width, height } = dimensions;
  return (
    <>
      {/* Backdrop */}
      {!accessible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: zIndex - 1,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Dialog */}
      <div
        style={{
          position: 'fixed',
          left: x,
          top: y,
          width,
          height,
          pointerEvents: 'auto',
          zIndex: zIndex,
        }}
      >
        {/* Corner ornaments */}
        <CornerBorder position="top-left" size={cornerSize(tileSize)} zIndex={zIndex + 1} />
        <CornerBorder position="top-right" size={cornerSize(tileSize)} zIndex={zIndex + 1} />
        <CornerBorder position="bottom-left" size={cornerSize(tileSize)} zIndex={zIndex + 1} />
        <CornerBorder position="bottom-right" size={cornerSize(tileSize)} zIndex={zIndex + 1} />

        {/* Horizontal border */}
        <HorizontalBorder side="top" tileSize={tileSize} length={width} zIndex={zIndex} />
        <HorizontalBorder side="bottom" tileSize={tileSize} length={width} zIndex={zIndex} />

        {/* Vertical border */}
        <VerticalBorder side="left" tileSize={tileSize} length={height} zIndex={zIndex} />
        <VerticalBorder side="right" tileSize={tileSize} length={height} zIndex={zIndex} />

        {/* Dialog content area */}
        <div
          style={{
            position: 'absolute',
            left: cornerSize(tileSize),
            top: cornerSize(tileSize),
            width: width - cornerSize(tileSize) * 2,
            height: flexibleSizing ? 'auto' : height - cornerSize(tileSize) * 2,
            maxHeight: flexibleSizing ? height - cornerSize(tileSize) * 2 : undefined,
            backgroundColor: !accessible ? 'rgba(0, 0, 0, 0.8)' : undefined,
            padding: !accessible ? '20px' : undefined,
            boxSizing: 'border-box',
            overflowY: flexibleSizing ? 'visible' : 'auto',
            zIndex: zIndex,
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
              zIndex: zIndex + 2,
            }}
          >
            {primaryButton && <div>{primaryButton}</div>}
            {secondaryButton && <div>{secondaryButton}</div>}
          </div>
        )}
      </div>
    </>
  );
};

export default FantasyBorderFrame;
