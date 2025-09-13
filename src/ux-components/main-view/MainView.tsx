import React, { useState, useCallback } from 'react';
import styles from './css/Background.module.css';
import TopPanel from '../top-panel/TopPanel';
import Battlefield from '../battlefield/Battlefield';
import StartGameWindow from '../dialogs/StartGameWindow';
import SaveGameDialog from '../dialogs/SaveGameDialog';
import OpponentInfoDialog, { OpponentWithDiplomacy } from '../dialogs/OpponentInfoDialog';
import { BattlefieldSize } from '../../types/BattlefieldSize';
import { GameConfig } from '../../types/GameConfig';
import { defaultTileSize } from '../fantasy-border-frame/FantasyBorderFrame';

const MainView: React.FC = () => {
  const [showStartWindow, setShowStartWindow] = useState<boolean>(true);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentWithDiplomacy | null>(null);
  const [battlefieldSize, setBattlefieldSize] = useState<BattlefieldSize>('medium');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameConfig, setGameConfig] = useState<GameConfig | undefined>(undefined);

  const TOP_PANEL_HEIGHT = 300;
  const TILE_SIZE = defaultTileSize;

  const handleStartGame = useCallback((config: GameConfig) => {
    setGameConfig(config);
    setBattlefieldSize(config.mapSize);
    setShowStartWindow(false);
    setGameStarted(true);
    console.log('Starting game with config:', config);
  }, []);

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, []);

  const handleShowSaveDialog = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  const handleCloseSaveDialog = useCallback(() => {
    setShowSaveDialog(false);
  }, []);

  const handleSaveGame = useCallback((saveName: string) => {
    console.log('Saving game with name:', saveName);
    // TODO: Implement actual save game functionality
  }, []);

  const handleShowOpponentInfo = useCallback((opponent: OpponentWithDiplomacy) => {
    setSelectedOpponent(opponent);
  }, []);

  const handleCloseOpponentInfo = useCallback(() => {
    setSelectedOpponent(null);
  }, []);

  return (
    <div className={styles.backgroundStyle} id="MainCanvas">
      {/* Content components */}
      <TopPanel
        height={TOP_PANEL_HEIGHT}
        tileSize={TILE_SIZE}
        config={gameConfig}
        onNewGame={handleShowStartWindow}
        onLoadGame={() => console.log('Load Game functionality to be implemented')}
        onOpenSaveDialog={handleShowSaveDialog}
        onEndTurn={() => console.log('End turn clicked')}
        onOpponentSelect={handleShowOpponentInfo}
      />
      <Battlefield
        top={TOP_PANEL_HEIGHT - Math.min(TILE_SIZE.height, TILE_SIZE.width)}
        tileSize={TILE_SIZE}
        battlefieldSize={battlefieldSize}
        key={`map-${battlefieldSize}-${gameStarted}`}
      />

      {/* Start Game Window - shown as overlay */}
      {showStartWindow && <StartGameWindow onStartGame={handleStartGame} />}

      {/* Save Game Dialog - shown as overlay */}
      <SaveGameDialog
        isOpen={showSaveDialog}
        onClose={handleCloseSaveDialog}
        onSave={handleSaveGame}
      />

      {/* Opponent Info Dialog - shown as overlay */}
      <OpponentInfoDialog opponent={selectedOpponent} onClose={handleCloseOpponentInfo} />
    </div>
  );
};

export default MainView;
