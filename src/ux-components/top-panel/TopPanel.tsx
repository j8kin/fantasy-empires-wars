import React from 'react';
import { GameState } from '../../types/HexTileState';
import PlayerAvatar from '../avatars/PlayerAvatar';
import GameControl from '../game-controls/GameControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import { OpponentWithDiplomacy } from '../popups/OpponentInfoPopup';
import FantasyBorderFrame, { BorderTileSize } from '../fantasy-border-frame/FantasyBorderFrame';
import EndOfTurnButton from '../buttons/EndOfTurnButton';
import styles from './css/TopPanel.module.css';

interface TopPanelProps {
  height: number;
  tileSize: BorderTileSize;
  gameState?: GameState;
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onOpenSaveDialog?: () => void;
  onEndTurn?: () => void;
  onOpponentSelect?: (
    opponent: OpponentWithDiplomacy,
    screenPosition: { x: number; y: number }
  ) => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  height,
  tileSize,
  gameState,
  onNewGame,
  onLoadGame,
  onOpenSaveDialog,
  onEndTurn,
  onOpponentSelect,
}) => {
  const MIN_OPPONENTS = 2;

  // Use config first, fallback to gameState
  const selectedPlayer = gameState?.selectedPlayer;
  const opponents = gameState?.opponents;

  const endTurnButton = (
    <EndOfTurnButton
      onClick={() => {
        console.log('End turn clicked');
        if (onEndTurn) {
          onEndTurn();
        }
      }}
    />
  );

  return (
    <FantasyBorderFrame
      screenPosition={{ x: 0, y: 0 }}
      dimensions={{ width: window.innerWidth, height }}
      primaryButton={endTurnButton}
      tileSize={tileSize}
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
          {/* Left Side - Player Info */}
          {selectedPlayer && (
            <div className={styles.playerInfoContainer}>
              <PlayerAvatar
                player={selectedPlayer}
                size={height - Math.min(tileSize.height, tileSize.width) * 2 - 10}
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
