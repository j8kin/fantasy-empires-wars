import React, { useCallback } from 'react';
import PlayerAvatar from '../avatars/PlayerAvatar';
import GameControl from '../game-controls/GameControl';
import PlayActionsControl from '../game-controls/PlayActionsControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import FantasyBorderFrame, { Dimensions } from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';
import styles from './css/TopPanel.module.css';
import { ButtonName } from '../buttons/GameButtonProps';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameState } from '../../contexts/GameContext';

export interface TopPanelProps {
  height: number;
  tileDimensions: Dimensions;
}

const TopPanel: React.FC<TopPanelProps> = ({ height, tileDimensions }) => {
  const {
    setShowStartWindow,
    setShowSaveDialog,
    setShowCastSpellDialog,
    setShowConstructBuildingDialog,
  } = useApplicationContext();
  const { gameState } = useGameState();

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, [setShowStartWindow]);

  const handleShowSaveDialog = useCallback(() => {
    setShowSaveDialog(true);
  }, [setShowSaveDialog]);

  const handleShowCastSpellDialog = useCallback(() => {
    setShowCastSpellDialog(true);
  }, [setShowCastSpellDialog]);

  const handleShowConstructBuildingDialog = useCallback(() => {
    setShowConstructBuildingDialog(true);
  }, [setShowConstructBuildingDialog]);

  // Use config first, fallback to gameState
  const selectedPlayer = gameState?.selectedPlayer;

  const endTurnButton = <GameButton buttonName={ButtonName.TURN} />;

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
          <PlayActionsControl
            onBuild={handleShowConstructBuildingDialog}
            onCast={handleShowCastSpellDialog}
          />

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

          <OpponentsPanel />

          {/* Right Side - Game Controls */}
          <GameControl onNewGame={handleShowStartWindow} onOpenSaveDialog={handleShowSaveDialog} />
        </div>
      </div>
    </FantasyBorderFrame>
  );
};

export default TopPanel;
