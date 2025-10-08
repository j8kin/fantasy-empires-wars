import React, { useCallback } from 'react';
import { GameState } from '../../types/HexTileState';
import PlayerAvatar from '../avatars/PlayerAvatar';
import GameControl from '../game-controls/GameControl';
import PlayActionsControl from '../game-controls/PlayActionsControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import { OpponentWithDiplomacy } from '../popups/OpponentInfoPopup';
import FantasyBorderFrame, { Dimensions } from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';
import styles from './css/TopPanel.module.css';
import { ButtonName } from '../buttons/GameButtonProps';
import { useApplicationContext } from '../../contexts/ApplicationContext';

export interface TopPanelProps {
  height: number;
  tileDimensions: Dimensions;
  gameState?: GameState;
  onEndTurn?: () => void;
  onBuild?: () => void;
  onMove?: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({
  height,
  tileDimensions,
  gameState,
  onEndTurn,
  onBuild,
  onMove,
}) => {
  const {
    setShowStartWindow,
    setShowSaveDialog,
    setShowCastSpellDialog,
    setLandHideModePlayerId,
    showOpponentInfo,
  } = useApplicationContext();

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, [setShowStartWindow]);

  const handleShowSaveDialog = useCallback(() => {
    setShowSaveDialog(true);
  }, [setShowSaveDialog]);

  const handleShowCastSpellDialog = useCallback(() => {
    setShowCastSpellDialog(true);
  }, [setShowCastSpellDialog]);

  const handleShowOpponentInfo = useCallback(
    (opponent: OpponentWithDiplomacy, screenPosition: { x: number; y: number }) => {
      showOpponentInfo(opponent, screenPosition);
      setLandHideModePlayerId(opponent.id);
    },
    [setLandHideModePlayerId, showOpponentInfo]
  );
  const MIN_OPPONENTS = 2;

  // Use config first, fallback to gameState
  const selectedPlayer = gameState?.selectedPlayer;
  const opponents = gameState?.opponents;

  const endTurnButton = <GameButton buttonName={ButtonName.TURN} onClick={onEndTurn} />;

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
            onBuild={onBuild}
            onCast={handleShowCastSpellDialog}
            onMove={onMove}
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

          <OpponentsPanel
            selectedPlayer={selectedPlayer}
            numberOfOpponents={opponents?.length || MIN_OPPONENTS}
            opponents={opponents}
            onOpponentSelect={handleShowOpponentInfo}
          />

          {/* Right Side - Game Controls */}
          <GameControl
            onNewGame={handleShowStartWindow}
            // TODO: Implement load game functionality (onLoadGame)
            onOpenSaveDialog={handleShowSaveDialog}
          />
        </div>
      </div>
    </FantasyBorderFrame>
  );
};

export default TopPanel;
