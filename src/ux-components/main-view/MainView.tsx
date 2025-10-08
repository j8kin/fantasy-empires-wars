import React, { useState, useCallback } from 'react';
import styles from './css/Background.module.css';
import TopPanel from '../top-panel/TopPanel';
import Battlefield from '../battlefield/Battlefield';
import NewGameDialog from '../dialogs/NewGameDialog';
import SaveGameDialog from '../dialogs/SaveGameDialog';
import CastSpellDialog from '../dialogs/CastSpellDialog';
import OpponentInfoPopup, { OpponentWithDiplomacy } from '../popups/OpponentInfoPopup';
import SelectOpponentDialog from '../dialogs/SelectOpponentDialog';
import ProgressPopup from '../popups/ProgressPopup';
import { SelectionProvider } from '../../contexts/SelectionContext';
import { GamePlayer } from '../../types/GamePlayer';
import { GameState } from '../../types/HexTileState';
import { useMapState } from '../../hooks/useMapState';
import { defaultTileDimensions, ScreenPosition } from '../fantasy-border-frame/FantasyBorderFrame';

const MainView: React.FC = () => {
  const [showStartWindow, setShowStartWindow] = useState<boolean>(true);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showCastSpellDialog, setShowCastSpellDialog] = useState<boolean>(false);
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentWithDiplomacy | undefined>(
    undefined
  );
  const [opponentScreenPosition, setOpponentScreenPosition] = useState<ScreenPosition>({
    x: 0,
    y: 0,
  });
  const [showSelectOpponentDialog, setShowSelectOpponentDialog] = useState<boolean>(false);
  const [selectOpponentExcludedIds, setSelectOpponentExcludedIds] = useState<string[]>([]);
  const [selectOpponentCallback, setSelectOpponentCallback] = useState<
    ((player: GamePlayer) => void) | null
  >(null);
  const [allowEmptyPlayer, setAllowEmptyPlayer] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [landHideModePlayerId, setLandHideModePlayerId] = useState<string | undefined>(undefined);
  const [showProgressPopup, setShowProgressPopup] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');

  // Initialize the game state at the MainView level
  const { gameState, updateGameConfig } = useMapState('medium');

  const TOP_PANEL_HEIGHT = 300;
  const TILE_SIZE = defaultTileDimensions;

  const handleStartGame = useCallback(
    (config: GameState) => {
      setShowStartWindow(false);
      setProgressMessage('Creating new game...');
      setShowProgressPopup(true);

      // Show game progress
      setTimeout(() => {
        updateGameConfig(config);
        setGameStarted(true);
        setShowProgressPopup(false);
      }, 100);
    },
    [updateGameConfig]
  );

  const handleStartGameCancel = useCallback(() => {
    setShowStartWindow(false);
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

  const handleShowOpponentInfo = useCallback(
    (opponent: OpponentWithDiplomacy, screenPosition: { x: number; y: number }) => {
      setSelectedOpponent(opponent);
      setOpponentScreenPosition(screenPosition);
      setLandHideModePlayerId(opponent.id);
    },
    []
  );

  const handleCloseOpponentInfo = useCallback(() => {
    setSelectedOpponent(undefined);
    setLandHideModePlayerId(undefined);
  }, []);

  const handleShowSelectOpponentDialog = useCallback(
    (
      excludedPlayerIds: string[],
      onSelect: (player: GamePlayer) => void,
      allowEmptyPlayer: boolean = true
    ) => {
      setSelectOpponentExcludedIds(excludedPlayerIds);
      setSelectOpponentCallback(() => onSelect);
      setAllowEmptyPlayer(allowEmptyPlayer);
      setShowSelectOpponentDialog(true);
    },
    []
  );

  const handleOpponentSelect = useCallback(
    (player: GamePlayer) => {
      if (selectOpponentCallback) {
        selectOpponentCallback(player);
      }
      setShowSelectOpponentDialog(false);
      setSelectOpponentCallback(null);
    },
    [selectOpponentCallback]
  );

  const handleOpponentDialogCancel = useCallback(() => {
    setShowSelectOpponentDialog(false);
    setSelectOpponentCallback(null);
  }, []);

  const handleShowCastSpellDialog = useCallback(() => {
    setShowCastSpellDialog(true);
  }, []);

  const handleCloseCastSpellDialog = useCallback(() => {
    setShowCastSpellDialog(false);
  }, []);

  return (
    <SelectionProvider>
      <main className={styles.backgroundStyle} id="MainCanvas">
        {/* Content components */}
        <TopPanel
          height={TOP_PANEL_HEIGHT}
          tileDimensions={TILE_SIZE}
          gameState={gameState}
          onNewGame={handleShowStartWindow}
          onOpenSaveDialog={handleShowSaveDialog}
          onOpponentSelect={handleShowOpponentInfo}
          onCast={handleShowCastSpellDialog}
        />
        <Battlefield
          topPanelHeight={TOP_PANEL_HEIGHT - Math.min(TILE_SIZE.height, TILE_SIZE.width)}
          tileSize={TILE_SIZE}
          gameState={gameState}
          landHideModePlayerId={landHideModePlayerId}
          key={`map-${gameState.mapSize}-${gameStarted}`}
        />

        {/*Game Dialogs */}

        {/* Start Game Dialog - shown as overlay */}
        {showStartWindow && (
          <NewGameDialog
            onStartGame={handleStartGame}
            onCancel={handleStartGameCancel}
            onShowSelectOpponentDialog={handleShowSelectOpponentDialog}
          />
        )}

        {/* Save Game Dialog - shown as overlay */}
        <SaveGameDialog
          isOpen={showSaveDialog}
          onClose={handleCloseSaveDialog}
          onSave={handleSaveGame}
        />

        {/* Cast Spell Dialog - shown as overlay */}
        <CastSpellDialog isOpen={showCastSpellDialog} onClose={handleCloseCastSpellDialog} />

        {/* Opponent Info Dialog - shown as overlay */}
        <OpponentInfoPopup
          opponent={selectedOpponent}
          screenPosition={opponentScreenPosition}
          onClose={handleCloseOpponentInfo}
        />

        {/* Select Opponent Dialog - shown as overlay */}
        {showSelectOpponentDialog && (
          <SelectOpponentDialog
            excludedPlayerIds={selectOpponentExcludedIds}
            onSelect={handleOpponentSelect}
            onCancel={handleOpponentDialogCancel}
            allowEmptyPlayer={allowEmptyPlayer}
          />
        )}

        {/* Progress Popup - shown as overlay */}
        {showProgressPopup && (
          <ProgressPopup
            screenPosition={{
              x: typeof window !== 'undefined' ? (window.innerWidth - 400) / 2 : 0,
              y: typeof window !== 'undefined' ? (window.innerHeight - 200) / 2 : 0,
            }}
            gameState={gameState}
            onClose={() => {}}
            message={progressMessage}
          />
        )}
      </main>
    </SelectionProvider>
  );
};

export default MainView;
