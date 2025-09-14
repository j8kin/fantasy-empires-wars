import React from 'react';
import { GameConfig } from '../../types/GameConfig';
import PlayerAvatar from '../avatars/PlayerAvatar';
import GameControl from '../game-controls/GameControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import { OpponentWithDiplomacy } from '../dialogs/OpponentInfoDialog';
import FantasyBorderFrame, { BorderTileSize } from '../fantasy-border-frame/FantasyBorderFrame';
import EndOfTurnButton from '../buttons/EndOfTurnButton';
import styles from './css/TopPanel.module.css';

interface TopPanelProps {
  height: number;
  tileSize: BorderTileSize;
  config?: GameConfig;
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onOpenSaveDialog?: () => void;
  onEndTurn?: () => void;
  onOpponentSelect?: (opponent: OpponentWithDiplomacy) => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  height,
  tileSize,
  config,
  onNewGame,
  onLoadGame,
  onOpenSaveDialog,
  onEndTurn,
  onOpponentSelect,
}) => {
  const MIN_OPPONENTS = 2;

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
      x={0}
      y={0}
      width={window.innerWidth}
      height={height}
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
          {config?.selectedPlayer && (
            <div className={styles.playerInfoContainer}>
              <PlayerAvatar
                player={config?.selectedPlayer}
                size={height - Math.min(tileSize.height, tileSize.width) * 2 - 10}
                shape="rectangle"
                borderColor={config?.selectedPlayer.color}
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
            opponents={config?.opponents}
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
