import React, { useCallback } from 'react';
import styles from './css/Background.module.css';
import TopPanel from '../top-panel/TopPanel';
import Battlefield from '../battlefield/Battlefield';
import NewGameDialog from '../dialogs/NewGameDialog';
import SaveGameDialog from '../dialogs/SaveGameDialog';
import CastSpellDialog from '../dialogs/CastSpellDialog';
import OpponentInfoPopup, { OpponentWithDiplomacy } from '../popups/OpponentInfoPopup';
import SelectOpponentDialog from '../dialogs/SelectOpponentDialog';
import ProgressPopup from '../popups/ProgressPopup';
import {
  ApplicationContextProvider,
  useApplicationContext,
} from '../../contexts/ApplicationContext';
import { GamePlayer } from '../../types/GamePlayer';
import { useMapState } from '../../hooks/useMapState';
import { defaultTileDimensions } from '../fantasy-border-frame/FantasyBorderFrame';

const MainViewContent: React.FC = () => {
  const {
    showStartWindow,
    showCastSpellDialog,
    selectedOpponent,
    opponentScreenPosition,
    showSelectOpponentDialog,
    selectOpponentExcludedIds,
    selectOpponentCallback,
    allowEmptyPlayer,
    showProgressPopup,
    progressMessage,
    gameStarted,
    landHideModePlayerId,
    setShowStartWindow,
    setShowSaveDialog,
    setShowCastSpellDialog,
    setLandHideModePlayerId,
    showOpponentInfo,
    hideOpponentInfo,
    showSelectOpponentDialogWithConfig,
    hideSelectOpponentDialog,
  } = useApplicationContext();

  // Initialize the game state at the MainView level
  const { gameState } = useMapState('medium');

  const TOP_PANEL_HEIGHT = 300;
  const TILE_SIZE = defaultTileDimensions;

  const handleShowStartWindow = useCallback(() => {
    setShowStartWindow(true);
  }, [setShowStartWindow]);

  const handleShowSaveDialog = useCallback(() => {
    setShowSaveDialog(true);
  }, [setShowSaveDialog]);

  const handleShowOpponentInfo = useCallback(
    (opponent: OpponentWithDiplomacy, screenPosition: { x: number; y: number }) => {
      showOpponentInfo(opponent, screenPosition);
      setLandHideModePlayerId(opponent.id);
    },
    [setLandHideModePlayerId, showOpponentInfo]
  );

  const handleCloseOpponentInfo = useCallback(() => {
    hideOpponentInfo();
    setLandHideModePlayerId(undefined);
  }, [hideOpponentInfo, setLandHideModePlayerId]);

  const handleShowSelectOpponentDialog = useCallback(
    (
      excludedPlayerIds: string[],
      onSelect: (player: GamePlayer) => void,
      allowEmptyPlayer: boolean = true
    ) => {
      showSelectOpponentDialogWithConfig(excludedPlayerIds, onSelect, allowEmptyPlayer);
    },
    [showSelectOpponentDialogWithConfig]
  );

  const handleOpponentSelect = useCallback(
    (player: GamePlayer) => {
      if (selectOpponentCallback) {
        selectOpponentCallback(player);
      }
      hideSelectOpponentDialog();
    },
    [selectOpponentCallback, hideSelectOpponentDialog]
  );

  const handleOpponentDialogCancel = useCallback(() => {
    hideSelectOpponentDialog();
  }, [hideSelectOpponentDialog]);

  const handleShowCastSpellDialog = useCallback(() => {
    setShowCastSpellDialog(true);
  }, [setShowCastSpellDialog]);

  const handleCloseCastSpellDialog = useCallback(() => {
    setShowCastSpellDialog(false);
  }, [setShowCastSpellDialog]);

  return (
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
        <NewGameDialog onShowSelectOpponentDialog={handleShowSelectOpponentDialog} />
      )}

      {/* Save Game Dialog - shown as overlay */}
      <SaveGameDialog />

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
  );
};

const MainView: React.FC = () => {
  return (
    <ApplicationContextProvider>
      <MainViewContent />
    </ApplicationContextProvider>
  );
};

export default MainView;
