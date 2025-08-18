import React from 'react';
import { LAYOUT_CONSTANTS } from './BorderSystem';
import ManaVial from './ManaVial';

export type MapSize = 'small' | 'medium' | 'large' | 'huge';

interface ManaPanelProps {
  mapSize: MapSize;
  onMapSizeChange: (size: MapSize) => void;
}

const ManaPanel: React.FC<ManaPanelProps> = ({ mapSize, onMapSizeChange }) => {
  return (
    <div style={frameContainerStyle} id="ManaPanel">
      <div style={vialPanelStyle}>
        <ManaVial color="black" percentage={75} />
        <ManaVial color="white" percentage={50} />
        <ManaVial color="blue" percentage={100} />
        <ManaVial color="green" percentage={25} />
        <ManaVial color="red" percentage={5} />
      </div>
      <div style={mapSelectorStyle}>
        <label style={labelStyle}>Map Size:</label>
        <select
          value={mapSize}
          onChange={(e) => onMapSizeChange(e.target.value as MapSize)}
          style={selectStyle}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="huge">Huge</option>
        </select>
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

const mapSelectorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '20px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
};

const selectStyle: React.CSSProperties = {
  fontSize: '14px',
  padding: '5px 10px',
  borderRadius: '5px',
  border: '2px solid #333',
  backgroundColor: '#fff',
  color: '#333',
  cursor: 'pointer',
};

export default ManaPanel;
