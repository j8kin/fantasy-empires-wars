import React from 'react';
import { LAYOUT_CONSTANTS } from '../borders/BorderSystem';
import { GameConfig } from '../../types/GameConfig';
import PlayerAvatar from '../avatars/PlayerAvatar';
import GameControl from '../game-controls/GameControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import styles from './css/TopPanel.module.css';

interface TopPanelProps {
  config?: GameConfig;
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onSaveGame?: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({ config, onNewGame, onLoadGame, onSaveGame }) => {
  const dynamicStyles: React.CSSProperties = {
    left: LAYOUT_CONSTANTS.BORDER_WIDTH,
    top: LAYOUT_CONSTANTS.MANA_PANEL_TOP_MARGIN,
    right: LAYOUT_CONSTANTS.BORDER_WIDTH,
    height: LAYOUT_CONSTANTS.MANA_PANEL_HEIGHT,
  };
  const MIN_OPPONENTS = 2;

  return (
    <div
      id="TopPanel"
      data-testid="TopPanel"
      style={dynamicStyles}
      className={`${styles.frameContainer} top-bar-panel`}
    >
      <div className={styles.panelContainer}>
        {/* Left Side - Player Info */}
        {config?.selectedPlayer && (
          <div className={styles.playerInfoContainer}>
            <PlayerAvatar
              player={config?.selectedPlayer}
              size={190}
              shape="rectangle"
              borderColor={config?.selectedPlayer.defaultColor}
            />
            <div className={styles.playerDetails}>
              <div className={styles.playerName}>{config?.selectedPlayer.name}</div>
              <div className={styles.moneyInfo}>
                <div className={styles.moneyItem}>Gold: 1,500</div>
                <div className={styles.moneyItem}>+250/turn</div>
              </div>
            </div>
          </div>
        )}

        {/* Center - Mana Vials */}
        <VialPanel />

        <OpponentsPanel
          selectedPlayer={config?.selectedPlayer}
          numberOfOpponents={config?.numberOfOpponents || MIN_OPPONENTS}
        />
        {/* Right Side - Game Controls */}
        <GameControl onNewGame={onNewGame} onLoadGame={onLoadGame} onSaveGame={onSaveGame} />
      </div>
    </div>
  );
};

export default TopPanel;
