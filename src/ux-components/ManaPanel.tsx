import React from 'react';

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
  width: '85%',
  height: '200px',
  left: '50px',
  top: '50px',
  boxSizing: 'border-box',
};

const vialPanelStyle: React.CSSProperties = {
  gap: '20px', // Add spacing between ManaVials
  padding: '15px', // Add padding around the container
};

export default ManaPanel;
