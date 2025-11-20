import React from 'react';
import styles from './css/TopPanel.module.css';

import { useGameContext } from '../../contexts/GameContext';
import { TurnPhase } from '../../types/GameState';

import GameControl from '../game-controls/GameControl';
import MapActionsControl from '../game-controls/MapActionsControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import GameButton from '../buttons/GameButton';
import FantasyBorderFrame, { FrameSize } from '../fantasy-border-frame/FantasyBorderFrame';
import PlayerSummary from '../player/PlayerSummary';
import { ButtonName } from '../../types/ButtonName';
import UnitActionControl from '../game-controls/UnitActionControl';

export interface TopPanelProps {
  height: number;
  tileDimensions: FrameSize;
}

const TopPanel: React.FC<TopPanelProps> = ({ height, tileDimensions }) => {
  const { endCurrentTurn, gameState } = useGameContext();

  const avatarSize = height - Math.min(tileDimensions.height, tileDimensions.width) * 2 - 10;

  const handleEndTurn = () => {
    if (gameState?.turnPhase === TurnPhase.MAIN) {
      endCurrentTurn();
    }
  };

  const endTurnButton = <GameButton buttonName={ButtonName.TURN} onClick={handleEndTurn} />;

  return (
    <FantasyBorderFrame
      screenPosition={{ x: 0, y: 0 }}
      frameSize={{ width: window.innerWidth, height }}
      primaryButton={endTurnButton}
      tileDimensions={tileDimensions}
      accessible={true}
      zIndex={100}
    >
      <div
        id="TopPanel"
        data-testid="TopPanel"
        className={`${styles.frameContainer} ${styles.fullSize} top-bar-panel`}
      >
        <div className={styles.panelContainer}>
          {/* Left Side - Action Controls only if the game is started*/}
          <MapActionsControl />
          <UnitActionControl />

          {/* Display Player Info only if Game Started */}
          <PlayerSummary avatarSize={avatarSize} />

          {/* Center - Mana Vials only if Game Started */}
          <VialPanel />

          {/* Display Opponents only if Game Started */}
          <OpponentsPanel />

          {/* Right Side - Game Controls */}
          <GameControl />
        </div>
      </div>
    </FantasyBorderFrame>
  );
};

export default TopPanel;
