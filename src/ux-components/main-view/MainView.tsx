import React from 'react';
import styles from './css/Background.module.css';

import {
  ApplicationContextProvider,
  useApplicationContext,
} from '../../contexts/ApplicationContext';
import { GameProvider, useGameState } from '../../contexts/GameContext';

import TopPanel from '../top-panel/TopPanel';
import Battlefield from '../battlefield/Battlefield';
import NewGameDialog from '../dialogs/NewGameDialog';
import SaveGameDialog from '../dialogs/SaveGameDialog';
import CastSpellDialog from '../dialogs/CastSpellDialog';
import ConstructBuildingDialog from '../dialogs/ConstructBuildingDialog';
import SelectOpponentDialog from '../dialogs/SelectOpponentDialog';
import OpponentInfoPopup from '../popups/OpponentInfoPopup';
import ProgressPopup from '../popups/ProgressPopup';

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
    gameStarted,
    landHideModePlayerId,
    clearAllGlow,
  } = useApplicationContext();

  // Access game state from context
  const { gameState } = useGameState();

  const TOP_PANEL_HEIGHT = 300;
  const TILE_SIZE = defaultTileDimensions;

  const handleMainViewClick = () => {
    // Clear glow when clicking on the main background
    clearAllGlow();
  };

  return (
    <main className={styles.backgroundStyle} id="MainCanvas" onClick={handleMainViewClick}>
      {/* Content components */}
      <TopPanel height={TOP_PANEL_HEIGHT} tileDimensions={TILE_SIZE} />
      <Battlefield
        topPanelHeight={TOP_PANEL_HEIGHT - Math.min(TILE_SIZE.height, TILE_SIZE.width)}
        tileSize={TILE_SIZE}
        landHideModePlayerId={landHideModePlayerId}
        key={`map-${gameState.mapSize}-${gameStarted}`}
      />

      {/*Game Dialogs */}

      {/* Start Game Dialog - shown as overlay */}
      {showStartWindow && <NewGameDialog />}

      {/* Save Game Dialog - shown as overlay */}
      <SaveGameDialog />

      {/* Cast Spell Dialog - shown as overlay */}
      <CastSpellDialog />

      {/* Construct Building Dialog - shown as overlay */}
      <ConstructBuildingDialog />

      {/* Opponent Info Dialog - shown as overlay */}
      <OpponentInfoPopup opponent={selectedOpponent} screenPosition={opponentScreenPosition} />

      {/* Select Opponent Dialog - shown as overlay */}
      {showSelectOpponentDialog && (
        <SelectOpponentDialog
          excludedPlayerIds={selectOpponentExcludedIds}
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
          message={progressMessage}
        />
      )}
    </main>
  );
};

const MainView: React.FC = () => {
  return (
    <ApplicationContextProvider>
      <GameProvider initialMapSize="medium">
        <MainViewContent />
      </GameProvider>
    </ApplicationContextProvider>
  );
};

export default MainView;
