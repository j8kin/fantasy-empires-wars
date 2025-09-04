import React from 'react';
import { LAYOUT_CONSTANTS } from '../borders/BorderSystem';
import ManaVial from './ManaVial';
import { GamePlayer } from '../../types/GamePlayer';
import PlayerAvatar from '../avatars/PlayerAvatar';
import GameControl from '../game-controls/GameControl';
import styles from './css/TopPanel.module.css';

interface TopPanelProps {
  selectedPlayer?: GamePlayer;
  playerColor?: string;
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onSaveGame?: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  selectedPlayer,
  onNewGame,
  onLoadGame,
  onSaveGame,
}) => {
  const dynamicStyles: React.CSSProperties = {
    left: LAYOUT_CONSTANTS.BORDER_WIDTH,
    top: LAYOUT_CONSTANTS.MANA_PANEL_TOP_MARGIN,
    right: LAYOUT_CONSTANTS.BORDER_WIDTH,
    height: LAYOUT_CONSTANTS.MANA_PANEL_HEIGHT,
  };

  return (
    <div style={dynamicStyles} id="TopPanel" className={`${styles.frameContainer} top-bar-panel`}>
      <div className={styles.panelContainer}>
        {/* Left Side - Player Info */}
        {selectedPlayer && (
          <div className={styles.playerInfoContainer}>
            <PlayerAvatar
              player={selectedPlayer}
              size={190}
              shape="rectangle"
              borderColor="#d4af37"
            />
            <div className={styles.playerDetails}>
              <div className={styles.playerName}>{selectedPlayer.name}</div>
              <div className={styles.moneyInfo}>
                <div className={styles.moneyItem}>Gold: 1,500</div>
                <div className={styles.moneyItem}>+250/turn</div>
              </div>
            </div>
          </div>
        )}

        {/* Center - Mana Vials */}
        <div className={styles.vialPanel}>
          <ManaVial color="black" percentage={75} />
          <ManaVial color="white" percentage={50} />
          <ManaVial color="blue" percentage={100} />
          <ManaVial color="green" percentage={25} />
          <ManaVial color="red" percentage={5} />
        </div>

        {/* Right Side - Game Controls */}
        <GameControl onNewGame={onNewGame} onLoadGame={onLoadGame} onSaveGame={onSaveGame} />
      </div>
    </div>
  );
};

export default TopPanel;
