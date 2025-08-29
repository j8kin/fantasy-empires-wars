import React, { useState, useCallback } from 'react';
import styles from './css/Background.module.css';
import BorderSystem, { LAYOUT_CONSTANTS } from './BorderSystem';
import ManaPanel from './ManaPanel';
import MainMap from './MainMap';
import EndOfTurnButton from './EndOfTurnButton';
import StartGameWindow from './StartGameWindow';
import { MapSize } from '../types/MapSize';
import { GamePlayer } from '../types/GamePlayer';

interface StartGameConfig {
  mapSize: MapSize;
  selectedPlayer: GamePlayer;
  playerColor: string;
  numberOfOpponents: number;
}

const MainCanvas: React.FC = () => {
  const [showStartWindow, setShowStartWindow] = useState<boolean>(true);
  const [mapSize, setMapSize] = useState<MapSize>('medium');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameConfig, setGameConfig] = useState<StartGameConfig | null>(null);

  const handleStartGame = useCallback((config: StartGameConfig) => {
    setGameConfig(config);
    setMapSize(config.mapSize);
    setShowStartWindow(false);
    setGameStarted(true);
    console.log('Starting game with config:', config);
  }, []);

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, []);

  return (
    <div
      className={styles.backgroundStyle}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden', // Prevent any scrolling
      }}
      id="MainCanvas"
    >
      {/* Separate border system from content */}
      <BorderSystem />

      {/* Content components */}
      <ManaPanel
        selectedPlayer={gameConfig?.selectedPlayer}
        playerColor={gameConfig?.playerColor}
      />
      <MainMap mapSize={mapSize} key={`map-${mapSize}-${gameStarted}`} />

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

      {/* Add a button to show start window again for testing */}
      {gameStarted && (
        <button
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            background: '#d4af37',
            color: '#2c1810',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 100,
          }}
          onClick={handleShowStartWindow}
        >
          New Game
        </button>
      )}

      {/* Start Game Window - shown as overlay */}
      {showStartWindow && <StartGameWindow onStartGame={handleStartGame} />}
    </div>
  );
};

export default MainCanvas;
