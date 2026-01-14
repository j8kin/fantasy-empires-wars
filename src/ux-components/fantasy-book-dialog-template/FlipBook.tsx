import React from 'react';
import HTMLFlipBook from 'react-pageflip';
import styles from './css/FlipBook.module.css';

interface FlipBookProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxShadowOpacity?: number;
  showCover?: boolean;
  mobileScrollSupport?: boolean;
  startPage?: number;
  drawShadow?: boolean;
  flippingTime?: number;
  usePortrait?: boolean;
  startZIndex?: number;
  autoSize?: boolean;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  swipeDistance?: number;
  showPageCorners?: boolean;
  disableFlipByClick?: boolean;
  size?: 'fixed' | 'stretch';
  onClickOutside?: () => void;
}

const FlipBook: React.FC<FlipBookProps> = ({
  width = 333,
  height = 429,
  children,
  className = styles.flipbook,
  style = {},
  minWidth,
  minHeight,
  maxWidth = 860,
  maxHeight,
  maxShadowOpacity = 0,
  showCover = false,
  mobileScrollSupport = true,
  startPage = 0,
  drawShadow = false,
  flippingTime = 1000,
  usePortrait = false,
  startZIndex = 1000,
  autoSize = false,
  clickEventForward = true,
  useMouseEvents = true,
  swipeDistance = 30,
  showPageCorners = true,
  disableFlipByClick = false,
  size = 'fixed',
  onClickOutside,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClickOutside) {
      onClickOutside();
    }
  };

  return (
    <>
      <div
        data-testid="flipbook-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: startZIndex - 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={handleBackdropClick}
      >
        <div data-testid="flipbook-container" className={styles.flipbookContainer} onClick={(e) => e.stopPropagation()}>
          <HTMLFlipBook
            width={width}
            height={height}
            size={size}
            minWidth={minWidth || width}
            minHeight={minHeight || height}
            maxWidth={maxWidth || width}
            maxHeight={maxHeight || height}
            maxShadowOpacity={maxShadowOpacity}
            showCover={showCover}
            mobileScrollSupport={mobileScrollSupport}
            startPage={startPage}
            drawShadow={drawShadow}
            flippingTime={flippingTime}
            usePortrait={usePortrait}
            startZIndex={startZIndex}
            autoSize={autoSize}
            clickEventForward={clickEventForward}
            useMouseEvents={useMouseEvents}
            swipeDistance={swipeDistance}
            showPageCorners={showPageCorners}
            disableFlipByClick={disableFlipByClick}
            className={className}
            style={style}
          >
            {children}
          </HTMLFlipBook>
        </div>
      </div>
    </>
  );
};

export default FlipBook;
