import React from 'react';
import { LAYOUT_CONSTANTS } from './borders/BorderSystem';
import ManaVial from './ManaVial';
import { GamePlayer } from '../types/GamePlayer';
import PlayerAvatar from './PlayerAvatar';

interface ManaPanelProps {
  selectedPlayer?: GamePlayer;
  playerColor?: string;
}

const ManaPanel: React.FC<ManaPanelProps> = ({ selectedPlayer }) => {
  return (
    <div style={frameContainerStyle} id="ManaPanel">
      <div style={panelContainerStyle}>
        {/* Left Side - Player Info */}
        {selectedPlayer && (
          <div style={playerInfoContainerStyle}>
            <PlayerAvatar
              player={selectedPlayer}
              size={190}
              shape="rectangle"
              borderColor="#d4af37"
            />
            <div style={playerDetailsStyle}>
              <div style={playerNameStyle}>{selectedPlayer.name}</div>
              <div style={moneyInfoStyle}>
                <div style={moneyItemStyle}>Gold: 1,500</div>
                <div style={moneyItemStyle}>+250/turn</div>
              </div>
            </div>
          </div>
        )}

        {/* Center - Mana Vials */}
        <div style={vialPanelStyle}>
          <ManaVial color="black" percentage={75} />
          <ManaVial color="white" percentage={50} />
          <ManaVial color="blue" percentage={100} />
          <ManaVial color="green" percentage={25} />
          <ManaVial color="red" percentage={5} />
        </div>
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

const panelContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  padding: '3px',
};

const playerInfoContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '10px',
  flex: '0 0 auto',
};

const playerDetailsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const playerNameStyle: React.CSSProperties = {
  color: '#d4af37',
  fontSize: '14px',
  fontWeight: 'bold',
  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
};

const moneyInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const moneyItemStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '500',
  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
};

const vialPanelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: '30px',
  flex: '1 1 auto',
};
export default ManaPanel;
