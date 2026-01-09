import { v4 as uuid } from 'uuid';
import React, { Activity, useEffect, useRef } from 'react';
import styles from './css/Background.module.css';

import TopPanel from '../top-panel/TopPanel';
import Battlefield from '../battlefield/Battlefield';
import NewGameDialog from '../dialogs/NewGameDialog';
import SaveGameDialog from '../dialogs/SaveGameDialog';
import CastSpellDialog from '../dialogs/CastSpellDialog';
import EmpireTreasureDialog from '../dialogs/EmpireTreasureDialog';
import ConstructBuildingDialog from '../dialogs/ConstructBuildingDialog';
import RecruitArmyDialog from '../dialogs/RecruitArmyDialog';
import MoveArmyDialog from '../dialogs/MoveArmyDialog';
import SelectOpponentDialog from '../dialogs/SelectOpponentDialog';
import SendHeroInQuestDialog from '../dialogs/SendHeroInQuestDialog';
import DiplomacyContactDialog from '../dialogs/DiplomacyContactDialog';

import OpponentInfoPopup from '../popups/OpponentInfoPopup';
import ProgressPopup from '../popups/ProgressPopup';
import ErrorMessagePopup from '../popups/ErrorMessagePopup';
import RealmEventsPopup from '../popups/RealmEventsPopup';

import SpellCastAnimation from '../animations/SpellCastAnimation';

import {
  ApplicationContextProvider,
  useApplicationContext,
} from '../../contexts/ApplicationContext';
import { GameProvider, useGameContext } from '../../contexts/GameContext';
import { defaultTileDimensions } from '../fantasy-border-frame/FantasyBorderFrame';

import type { EmpireEvent } from '../../types/EmpireEvent';

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
    showEmpireEventsPopup,
    gameStarted,
    clearAllGlow,
    setSelectedLandAction,
    setIsArcaneExchangeMode,
    setProgressMessage,
    setShowProgressPopup,
    setErrorMessagePopupMessage,
    setShowErrorMessagePopup,
    showEmpireEvents,
    hideSpellAnimation,
  } = useApplicationContext();

  const { gameState, startNewTurn, setTurnManagerCallbacks } = useGameContext();

  const TOP_PANEL_HEIGHT = 300;
  const TILE_SIZE = defaultTileDimensions;
  const gameInitializedRef = useRef(false);
  const lastGameStateRef = useRef<string | null>(null);

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
      onEmpireEventResult: (results: EmpireEvent[]) => {
        showEmpireEvents(results);
      },
    });
  }, [
    setProgressMessage,
    setShowProgressPopup,
    setErrorMessagePopupMessage,
    setShowErrorMessagePopup,
    setTurnManagerCallbacks,
    showEmpireEvents,
  ]);

  // Start the first turn when game begins (only once per game)
  useEffect(() => {
    if (gameStarted && gameState && gameState.turn === 1) {
      const currentGameId = uuid();

      // Check if this is a different game than the last one
      if (lastGameStateRef.current !== currentGameId) {
        lastGameStateRef.current = currentGameId;
        gameInitializedRef.current = false; // Reset for new game
      }

      // Start turn only once per game
      if (!gameInitializedRef.current) {
        gameInitializedRef.current = true;
        startNewTurn();
      }
    } else if (!gameStarted) {
      // Reset the flags when game is not started
      gameInitializedRef.current = false;
      lastGameStateRef.current = null;
    }
  }, [gameStarted, gameState, startNewTurn]);

  const handleMainViewClick = () => {
    // Clear glow and selected item when clicking on the main background
    clearAllGlow();
    setSelectedLandAction(null);
    setIsArcaneExchangeMode(false);
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

      {/* Empire Treasure Dialog - shown as overlay */}
      <EmpireTreasureDialog />

      {/* Construct Building Dialog - shown as overlay */}
      <ConstructBuildingDialog />

      {/* Recruit Army Dialog - shown as overlay */}
      <RecruitArmyDialog />

      {/* Send Hero In Quest Dialog - shown as overlay */}
      <SendHeroInQuestDialog />

      {/* Send Hero In Quest Dialog - shown as overlay */}
      <MoveArmyDialog />

      {/* Diplomacy Contact Dialog - shown as overlay */}
      <DiplomacyContactDialog />

      {/* Opponent Info Dialog - shown as overlay */}
      <OpponentInfoPopup opponent={selectedOpponent} screenPosition={opponentScreenPosition} />

      {/* Progress Popup - shown as overlay */}
      <Activity mode={showProgressPopup ? 'visible' : 'hidden'}>
        <ProgressPopup
          screenPosition={{
            x: typeof window !== 'undefined' ? (window.innerWidth - 400) / 2 : 0,
            y: typeof window !== 'undefined' ? (window.innerHeight - 200) / 2 : 0,
          }}
          message={progressMessage}
        />
      </Activity>

      {/* Error Message Popup (use setErrorMessagePopupMessage to set message to display) */}
      <Activity mode={showErrorMessagePopup ? 'visible' : 'hidden'}>
        <ErrorMessagePopup
          screenPosition={{
            x: typeof window !== 'undefined' ? (window.innerWidth - 400) / 2 : 0,
            y: typeof window !== 'undefined' ? (window.innerHeight - 200) / 2 : 0,
          }}
        />
      </Activity>

      {/* Quest Results Popup */}
      <Activity mode={showEmpireEventsPopup ? 'visible' : 'hidden'}>
        <RealmEventsPopup
          screenPosition={{
            x: typeof window !== 'undefined' ? (window.innerWidth - 500) / 2 : 0,
            y: typeof window !== 'undefined' ? (window.innerHeight - 400) / 2 : 0,
          }}
        />
      </Activity>

      {/* Spell Cast Animation - positioned absolutely over the battlefield */}
      <SpellCastAnimation onAnimationComplete={hideSpellAnimation} />
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
