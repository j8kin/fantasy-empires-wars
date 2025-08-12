import React from 'react';
import { LAYOUT_CONSTANTS } from './BorderSystem';
import ManaVial from './ManaVial';

const ManaPanel: React.FC = () => {
  return (
    <div style={frameContainerStyle} id="ManaPanel">
      <div style={vialPanelStyle}>
        <ManaVial color="black" percentage={75} />
        <ManaVial color="white" percentage={50} />
        <ManaVial color="blue" percentage={100} />
        <ManaVial color="green" percentage={25} />
        <ManaVial color="red" percentage={5} />
      </div>
    </div>
  );
};

const frameContainerStyle: React.CSSProperties = {
  position: 'absolute',
  left: LAYOUT_CONSTANTS.BORDER_WIDTH,
  top: LAYOUT_CONSTANTS.MANA_PANEL_TOP_MARGIN,
  right: LAYOUT_CONSTANTS.BORDER_WIDTH,
  height: LAYOUT_CONSTANTS.MANA_PANEL_HEIGHT,
  boxSizing: 'border-box',
};

const vialPanelStyle: React.CSSProperties = {
  display: 'flex', // Use flexbox layout
  flexDirection: 'row', // Arrange items in a row
  justifyContent: 'center', // Center items horizontally
  gap: '30px', // Add spacing between ManaVials
  padding: '3px', // Add padding around the container
};

export default ManaPanel;
