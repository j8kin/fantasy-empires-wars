import React from 'react';
import styles from './css/TopPanel.module.css';

import { useGameContext } from '../../contexts/GameContext';

import GameControl from '../game-controls/GameControl';
import PlayActionsControl from '../game-controls/PlayActionsControl';
import VialPanel from '../vial-panel/VialPanel';
import OpponentsPanel from '../opponents-panel/OpponentsPanel';
import GameButton from '../buttons/GameButton';
import FantasyBorderFrame, { Dimensions } from '../fantasy-border-frame/FantasyBorderFrame';
import PlayerInfo from './PlayerInfo';
import { ButtonName } from '../../types/ButtonName';

export interface TopPanelProps {
  height: number;
  tileDimensions: Dimensions;
}

const TopPanel: React.FC<TopPanelProps> = ({ height, tileDimensions }) => {
  const { gameState } = useGameContext();
  const selectedPlayer = gameState?.selectedPlayer;

  const avatarSize = height - Math.min(tileDimensions.height, tileDimensions.width) * 2 - 10;
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
          <PlayActionsControl />

          {/* Display Player Info only if Game Started */}
          {selectedPlayer && <PlayerInfo avatarSize={avatarSize} />}

          {/* Center - Mana Vials only if Game Started */}
          {selectedPlayer && <VialPanel />}

          {/* Display Opponents only if Game Started */}
          {selectedPlayer && <OpponentsPanel />}

          {/* Right Side - Game Controls */}
          <GameControl />
        </div>
      </div>
    </FantasyBorderFrame>
  );
};

export default TopPanel;
