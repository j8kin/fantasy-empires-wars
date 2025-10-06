import React from 'react';
import { GameState } from '../../types/HexTileState';
import PlayerAvatar from '../avatars/PlayerAvatar';
import GameControl from '../game-controls/GameControl';
import PlayActionsControl from '../game-controls/PlayActionsControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import { OpponentWithDiplomacy } from '../popups/OpponentInfoPopup';
import FantasyBorderFrame, {
  Dimensions,
  ScreenPosition,
} from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';
import styles from './css/TopPanel.module.css';

export interface TopPanelProps {
  height: number;
  tileDimensions: Dimensions;
  gameState?: GameState;
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onOpenSaveDialog?: () => void;
  onEndTurn?: () => void;
  onOpponentSelect?: (opponent: OpponentWithDiplomacy, screenPosition: ScreenPosition) => void;
  onBuild?: () => void;
  onCast?: () => void;
  onMove?: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  height,
  tileDimensions,
  gameState,
  onNewGame,
  onLoadGame,
  onOpenSaveDialog,
  onOpponentSelect,
  onBuild,
  onCast,
  onMove,
}) => {
  const MIN_OPPONENTS = 2;

  // Use config first, fallback to gameState
  const selectedPlayer = gameState?.selectedPlayer;
  const opponents = gameState?.opponents;

  const endTurnButton = <GameButton buttonName="endofturn" />;

  return (
    <FantasyBorderFrame
      screenPosition={{ x: 0, y: 0 }}
      windowDimensions={{ width: window.innerWidth, height }}
      primaryButton={endTurnButton}
      tileDimensions={tileDimensions}
      accessible={true}
      zIndex={100}
    >
      <div
        id="TopPanel"
        data-testid="TopPanel"
        className={`${styles.frameContainer} top-bar-panel`}
        style={{ height: '100%', width: '100%' }}
      >
        <div className={styles.panelContainer}>
          {/* Left Side - Action Controls */}
          <PlayActionsControl onBuild={onBuild} onCast={onCast} onMove={onMove} />

          {/* Player Info */}
          {selectedPlayer && (
            <div className={styles.playerInfoContainer}>
              <PlayerAvatar
                player={selectedPlayer}
                size={height - Math.min(tileDimensions.height, tileDimensions.width) * 2 - 10}
                shape="rectangle"
                borderColor={selectedPlayer.color}
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
          <VialPanel />

          <OpponentsPanel
            selectedPlayer={selectedPlayer}
            numberOfOpponents={opponents?.length || MIN_OPPONENTS}
            opponents={opponents}
            onOpponentSelect={onOpponentSelect}
          />

          {/* Right Side - Game Controls */}
          <GameControl
            onNewGame={onNewGame}
            onLoadGame={onLoadGame}
            onOpenSaveDialog={onOpenSaveDialog}
          />
        </div>
      </div>
    </FantasyBorderFrame>
  );
};

export default TopPanel;
