import React from 'react';
import BorderCorner from './BorderCorner';
import BorderHorizontal from './BorderHorizontal';
import BorderVertical from './BorderVertical';

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
  zIndex?: number;
  accessible?: boolean;
}

// 50*180 since base tile is vertical
export const defaultTileSize: BorderTileSize = {
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
  zIndex = 1000,
  accessible = false,
}) => {
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
            pointerEvents: 'auto',
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
        <BorderCorner position="top-left" size={cornerSize(tileSize)} zIndex={zIndex + 1} />
        <BorderCorner position="top-right" size={cornerSize(tileSize)} zIndex={zIndex + 1} />
        <BorderCorner position="bottom-left" size={cornerSize(tileSize)} zIndex={zIndex + 1} />
        <BorderCorner position="bottom-right" size={cornerSize(tileSize)} zIndex={zIndex + 1} />

        {/* Horizontal border */}
        <BorderHorizontal side="top" tileSize={tileSize} length={width} zIndex={zIndex} />
        <BorderHorizontal side="bottom" tileSize={tileSize} length={width} zIndex={zIndex} />

        {/* Vertical border */}
        <BorderVertical side="left" tileSize={tileSize} length={height} zIndex={zIndex} />
        <BorderVertical side="right" tileSize={tileSize} length={height} zIndex={zIndex} />

        {/* Dialog content area */}
        <div
          style={{
            position: 'absolute',
            left: cornerSize(tileSize),
            top: cornerSize(tileSize),
            width: width - cornerSize(tileSize) * 2,
            height: height - cornerSize(tileSize) * 2,
            backgroundColor: !accessible ? 'rgba(0, 0, 0, 0.8)' : undefined,
            padding: !accessible ? '20px' : undefined,
            boxSizing: 'border-box',
            overflowY: 'auto',
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

export default DialogTemplate;
