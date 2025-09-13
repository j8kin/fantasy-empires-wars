import React from 'react';
import { GameConfig } from '../../types/GameConfig';
import PlayerAvatar from '../avatars/PlayerAvatar';
import GameControl from '../game-controls/GameControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import DialogTemplate from '../dialogs/template/DialogTemplate';
import EndOfTurnButton from '../buttons/EndOfTurnButton';
import styles from './css/TopPanel.module.css';

interface TopPanelProps {
  config?: GameConfig;
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onSaveGame?: (saveName: string) => void;
  onEndTurn?: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  config,
  onNewGame,
  onLoadGame,
  onSaveGame,
  onEndTurn,
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
    <DialogTemplate
      x={0}
      y={0}
      width={window.innerWidth}
      height={300}
      primaryButton={endTurnButton}
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
                size={190}
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
          />
          {/* Right Side - Game Controls */}
          <GameControl onNewGame={onNewGame} onLoadGame={onLoadGame} onSaveGame={onSaveGame} />
        </div>
      </div>
    </DialogTemplate>
  );
};

export default TopPanel;
