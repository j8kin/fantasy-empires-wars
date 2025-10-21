import React, { useEffect, useRef } from 'react';
import styles from './css/Background.module.css';

import {
  ApplicationContextProvider,
  useApplicationContext,
} from '../../contexts/ApplicationContext';
import { GameProvider, useGameContext } from '../../contexts/GameContext';

import TopPanel from '../top-panel/TopPanel';
import Battlefield from '../battlefield/Battlefield';
import NewGameDialog from '../dialogs/NewGameDialog';
import SaveGameDialog from '../dialogs/SaveGameDialog';
import CastSpellDialog from '../dialogs/CastSpellDialog';
import ConstructBuildingDialog from '../dialogs/ConstructBuildingDialog';
import SelectOpponentDialog from '../dialogs/SelectOpponentDialog';
import OpponentInfoPopup from '../popups/OpponentInfoPopup';
import ProgressPopup from '../popups/ProgressPopup';
import ErrorMessagePopup from '../popups/ErrorMessagePopup';

import { defaultTileDimensions } from '../fantasy-border-frame/FantasyBorderFrame';

const MainViewContent: React.FC = () => {
  const {
    showStartWindow,
    selectedOpponent,
    opponentScreenPosition,
    showSelectOpponentDialog,
    selectOpponentExcludedIds,
    allowEmptyPlayer,
    showProgressPopup,
    progressMessage,
    showErrorMessagePopup,
    gameStarted,
    clearAllGlow,
    setSelectedLandAction,
    setProgressMessage,
    setShowProgressPopup,
    setErrorMessagePopupMessage,
    setShowErrorMessagePopup,
  } = useApplicationContext();

  const { gameState, startNewTurn, setTurnManagerCallbacks } = useGameContext();

  const TOP_PANEL_HEIGHT = 300;
  const TILE_SIZE = defaultTileDimensions;
  const gameInitializedRef = useRef(false);

  // Initialize turn manager callbacks
  useEffect(() => {
    setTurnManagerCallbacks({
      onStartProgress: (message: string) => {
        setProgressMessage(message);
        setShowProgressPopup(true);
      },
      onHideProgress: () => {
        setShowProgressPopup(false);
      },
      onGameOver: (message: string) => {
        setErrorMessagePopupMessage(message);
        setShowErrorMessagePopup(true);
      },
      onComputerMainTurn: (gameState) => {
        // Stub for computer AI turn
        console.log('Computer player turn - AI not implemented yet');
      },
    });
  }, [
    setProgressMessage,
    setShowProgressPopup,
    setErrorMessagePopupMessage,
    setShowErrorMessagePopup,
    setTurnManagerCallbacks,
  ]);

  // Start the first turn when game begins (only once)
  useEffect(() => {
    if (gameStarted && gameState && gameState.turn === 1 && !gameInitializedRef.current) {
      gameInitializedRef.current = true;
      startNewTurn();
    } else if (!gameStarted) {
      // Reset the flag when game is not started
      gameInitializedRef.current = false;
    }
  }, [gameStarted, gameState, startNewTurn]);

  const handleMainViewClick = () => {
    // Clear glow and selected item when clicking on the main background
    clearAllGlow();
    setSelectedLandAction(null);
  };

  return (
    <main className={styles.backgroundStyle} id="MainCanvas" onClick={handleMainViewClick}>
      {/* Content components */}
      <TopPanel height={TOP_PANEL_HEIGHT} tileDimensions={TILE_SIZE} />

      <Battlefield
        topPanelHeight={TOP_PANEL_HEIGHT - Math.min(TILE_SIZE.height, TILE_SIZE.width)}
        tileSize={TILE_SIZE}
        key={`map-${gameStarted}`}
      />

      {/*Game Dialogs */}

      {/* Start Game Dialog - shown as overlay */}
      {showStartWindow && <NewGameDialog />}
      {/* Select Opponent Dialog is a part of New Game Dialog - shown as overlay */}
      {showSelectOpponentDialog && (
        <SelectOpponentDialog
          excludedPlayerIds={selectOpponentExcludedIds}
          allowEmptyPlayer={allowEmptyPlayer}
        />
      )}

      {/* Save Game Dialog - shown as overlay */}
      <SaveGameDialog />

      {/* Cast Spell Dialog - shown as overlay */}
      <CastSpellDialog />

      {/* Construct Building Dialog - shown as overlay */}
      <ConstructBuildingDialog />

      {/* Opponent Info Dialog - shown as overlay */}
      <OpponentInfoPopup opponent={selectedOpponent} screenPosition={opponentScreenPosition} />

      {/* Progress Popup - shown as overlay */}
      {showProgressPopup && (
        <ProgressPopup
          screenPosition={{
            x: typeof window !== 'undefined' ? (window.innerWidth - 400) / 2 : 0,
            y: typeof window !== 'undefined' ? (window.innerHeight - 200) / 2 : 0,
          }}
          message={progressMessage}
        />
      )}

      {/* Error Message Popup (use setErrorMessagePopupMessage to set message to display) */}
      {showErrorMessagePopup && (
        <ErrorMessagePopup
          screenPosition={{
            x: typeof window !== 'undefined' ? (window.innerWidth - 400) / 2 : 0,
            y: typeof window !== 'undefined' ? (window.innerHeight - 200) / 2 : 0,
          }}
        />
      )}
    </main>
  );
};

const MainView: React.FC = () => {
  return (
    <ApplicationContextProvider>
      <GameProvider>
        <MainViewContent />
      </GameProvider>
    </ApplicationContextProvider>
  );
};

export default MainView;
