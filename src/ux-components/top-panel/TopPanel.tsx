import React from 'react';
import styles from './css/TopPanel.module.css';

import { useGameContext } from '../../contexts/GameContext';
import { useApplicationContext } from '../../contexts/ApplicationContext';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import GameControl from '../game-controls/GameControl';
import MapActionsControl from '../game-controls/MapActionsControl';
import UnitActionControl from '../game-controls/UnitActionControl';
import VialPanel from '../vial-panel/VialPanel';
import ExchangeManaVialPanel from '../vial-panel/ExchangeManaVialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import PlayerSummary from '../player/PlayerSummary';
import GameButton from '../buttons/GameButton';
import { ButtonName } from '../../types/ButtonName';
import type { FrameSize } from '../../contexts/ApplicationContext';

export interface TopPanelProps {
  height: number;
  tileDimensions: FrameSize;
}

const TopPanel: React.FC<TopPanelProps> = ({ height, tileDimensions }) => {
  const { endCurrentTurn } = useGameContext();
  const { isArcaneExchangeMode } = useApplicationContext();

  const avatarSize = height - Math.min(tileDimensions.height, tileDimensions.width) * 2 - 10;

  const endTurnButton = <GameButton buttonName={ButtonName.TURN} onClick={endCurrentTurn} />;

  return (
    <FantasyBorderFrame
      screenPosition={{ x: 0, y: 0 }}
      frameSize={{ width: window.innerWidth, height }}
      primaryButton={endTurnButton}
      tileDimensions={tileDimensions}
      accessible={true}
      zIndex={100}
    >
      <div id="TopPanel" data-testid="TopPanel" className={`${styles.frameContainer} ${styles.fullSize} top-bar-panel`}>
        <div className={styles.panelContainer}>
          {/* Left Side - Action Controls only if the game is started*/}
          <MapActionsControl />
          <UnitActionControl />

          {/* Display Player Info only if Game Started */}
          <PlayerSummary avatarSize={avatarSize} />

          {/* Center - Mana Vials or Exchange Panel based on mode */}
          {isArcaneExchangeMode ? <ExchangeManaVialPanel /> : <VialPanel />}

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
