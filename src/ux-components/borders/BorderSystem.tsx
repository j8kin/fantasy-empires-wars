import React from 'react';
import VerticalOrnament from './VerticalOrnament';
import HorizontalOrnament from './HorizontalOrnament';
import CornerOrnament from './CornerOrnament';

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
      <VerticalOrnament isLeft={true} />
      <VerticalOrnament isLeft={false} />

      {/* Top horizontal border */}
      <HorizontalOrnament isTop={true} yOffset={0} />

      {/* Middle horizontal border between ManaPanel and MainMap */}
      <HorizontalOrnament isTop={true} yOffset={manaPanelBottomY} />

      {/* Bottom horizontal border */}
      <HorizontalOrnament isTop={false} yOffset={0} />

      {/* Corner borders - window corners */}
      <CornerOrnament isTop={true} isLeft={true} />
      <CornerOrnament isTop={true} isLeft={false} />
      <CornerOrnament isTop={false} isLeft={true} />
      <CornerOrnament isTop={false} isLeft={false} />

      {/* Corner borders at ends of middle horizontal border */}
      <CornerOrnament isTop={true} isLeft={true} yOffset={manaPanelBottomY} />
      <CornerOrnament isTop={true} isLeft={false} yOffset={manaPanelBottomY} />
    </>
  );
};

export default BorderSystem;
