import React, { useState, useCallback } from 'react';
import styles from './css/Background.module.css';
import BorderSystem, { LAYOUT_CONSTANTS } from '../borders/BorderSystem';
import TopPanel from '../top-panel/TopPanel';
import Battlefield from '../battlefield/Battlefield';
import EndOfTurnButton from '../buttons/EndOfTurnButton';
import StartGameWindow from '../dialogs/StartGameWindow';
import { BattlefieldSize } from '../../types/BattlefieldSize';
import { GamePlayer } from '../../types/GamePlayer';

interface StartGameConfig {
  mapSize: BattlefieldSize;
  selectedPlayer: GamePlayer;
  playerColor: string;
  numberOfOpponents: number;
}

const MainView: React.FC = () => {
  const [showStartWindow, setShowStartWindow] = useState<boolean>(true);
  const [battlefieldSize, setBattlefieldSize] = useState<BattlefieldSize>('medium');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameConfig, setGameConfig] = useState<StartGameConfig | null>(null);

  const handleStartGame = useCallback((config: StartGameConfig) => {
    setGameConfig(config);
    setBattlefieldSize(config.mapSize);
    setShowStartWindow(false);
    setGameStarted(true);
    console.log('Starting game with config:', config);
  }, []);

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, []);

  return (
    <div className={styles.backgroundStyle} id="MainCanvas">
      {/* Separate border system from content */}
      <BorderSystem />

      {/* Content components */}
      <TopPanel
        selectedPlayer={gameConfig?.selectedPlayer}
        playerColor={gameConfig?.playerColor}
        onNewGame={handleShowStartWindow}
        onLoadGame={() => console.log('Load Game functionality to be implemented')}
        onSaveGame={() => console.log('Save Game functionality to be implemented')}
      />
      <Battlefield
        battlefieldSize={battlefieldSize}
        key={`map-${battlefieldSize}-${gameStarted}`}
      />

      {/* End of Turn Button positioned in middle of second horizontal canvas */}
      <EndOfTurnButton
        style={{
          left: '50%',
          top: `${LAYOUT_CONSTANTS.MANA_PANEL_BOTTOM_Y + LAYOUT_CONSTANTS.BORDER_WIDTH / 2}px`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={() => {
          console.log('End turn clicked');
        }}
      />

      {/* Start Game Window - shown as overlay */}
      {showStartWindow && <StartGameWindow onStartGame={handleStartGame} />}
    </div>
  );
};

export default MainView;
