import React from 'react';
import HTMLFlipBook from 'react-pageflip';
import './css/FlipBook.css';

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
  showBackdrop?: boolean;
}

const FlipBook: React.FC<FlipBookProps> = ({
  width = 420,
  height = 380,
  children,
  className = 'flipbook',
  style = {},
  minWidth,
  minHeight,
  maxWidth,
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
  showBackdrop = true,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClickOutside) {
      onClickOutside();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <div
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
          <div className="flipbook-container" onClick={(e) => e.stopPropagation()}>
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
      )}
      {/* Original layout for when backdrop is disabled */}
      {!showBackdrop && (
        <div className="flipbook-container">
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
      )}
    </>
  );
};

export default FlipBook;
