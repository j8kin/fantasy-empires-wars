import React from 'react';
import BorderVerticalCanvas from './BorderVerticalCanvas';
import BorderHorizontalCanvas from './BorderHorizontalCanvas';
import BorderCornerCanvas from './BorderCornerCanvas';

// Layout constants for consistent sizing
export const LAYOUT_CONSTANTS = {
  BORDER_WIDTH: 50,
  MANA_PANEL_HEIGHT: 200,
  MANA_PANEL_TOP_MARGIN: 50,
  get MANA_PANEL_BOTTOM_Y() {
    return this.MANA_PANEL_HEIGHT + this.MANA_PANEL_TOP_MARGIN;
  },
};

const BorderSystem: React.FC = () => {
  const manaPanelBottomY = LAYOUT_CONSTANTS.MANA_PANEL_BOTTOM_Y;

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
