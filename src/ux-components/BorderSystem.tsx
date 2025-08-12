import React from 'react';
import BorderVerticalCanvas from './BorderVerticalCanvas';
import BorderHorizontalCanvas from './BorderHorizontalCanvas';
import BorderCornerCanvas from './BorderCornerCanvas';

const BorderSystem: React.FC = () => {
  // Get the height of ManaPanel (assuming 200px height + 50px top offset = 250px)
  const manaPanelBottomY = 250;

  return (
    <>
      {/* Vertical borders - full height from top to bottom without scrolling */}
      <BorderVerticalCanvas isLeft={true} />
      <BorderVerticalCanvas isLeft={false} />

      {/* Top horizontal border */}
      <BorderHorizontalCanvas isTop={true} yOffset={0} />
      
      {/* Middle horizontal border between ManaPanel and MainMap */}
      <BorderHorizontalCanvas isTop={true} yOffset={manaPanelBottomY} />
      
      {/* Bottom horizontal border */}
      <BorderHorizontalCanvas isTop={false} yOffset={0} />

      {/* Corner borders - window corners */}
      <BorderCornerCanvas isTop={true} isLeft={true} />
      <BorderCornerCanvas isTop={true} isLeft={false} />
      <BorderCornerCanvas isTop={false} isLeft={true} />
      <BorderCornerCanvas isTop={false} isLeft={false} />

      {/* Corner borders at ends of middle horizontal border */}
      <BorderCornerCanvas isTop={true} isLeft={true} yOffset={manaPanelBottomY} />
      <BorderCornerCanvas isTop={true} isLeft={false} yOffset={manaPanelBottomY} />
    </>
  );
};

export default BorderSystem;