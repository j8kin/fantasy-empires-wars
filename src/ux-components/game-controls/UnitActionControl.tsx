import React, { Activity, useCallback } from 'react';
import styles from './css/GameControl.module.css';

import GameButton from '../buttons/GameButton';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import { getLandId } from '../../state/map/land/LandId';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { findAllHeroesOnMap, getArmiesByPlayer, getPosition, isMoving } from '../../selectors/armySelectors';
import { hasAvailableSlot } from '../../selectors/buildingSelectors';
import { getPlayerLands } from '../../selectors/landSelectors';
import { ButtonName } from '../../types/ButtonName';

const UnitActionControl: React.FC = () => {
  const { addGlowingTile, clearAllGlow, setSelectedLandAction, setErrorMessagePopupMessage, setShowErrorMessagePopup } =
    useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowRecruitArmyDialog = useCallback(
    (event: React.MouseEvent) => {
      if (!gameState) return;

      clearAllGlow();

      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();

      // Get all lands owned by current player with BARRACKS or Mage Towers that have available slots
      const recruitmentLands = getPlayerLands(gameState).filter((l) => l.buildings.some((b) => hasAvailableSlot(b)));
      if (recruitmentLands.length === 0) {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
          setErrorMessagePopupMessage('No mustering grounds stand ready here.');
          setShowErrorMessagePopup(true);
        }
      } else {
        setSelectedLandAction('Recruit');
        // Add glowing to all recruitment lands
        recruitmentLands.forEach((land) => {
          const tileId = getLandId(land.mapPos);
          addGlowingTile(tileId);
        });
      }
    },
    [
      gameState,
      clearAllGlow,
      setErrorMessagePopupMessage,
      setShowErrorMessagePopup,
      setSelectedLandAction,
      addGlowingTile,
    ]
  );

  const handleShowSendHeroInQuestDialog = useCallback(
    (event: React.MouseEvent) => {
      if (!gameState) return;

      clearAllGlow();

      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();

      // Get all lands owned by current player that have heroes
      const questLands = findAllHeroesOnMap(gameState).map((r) => r.position);
      if (questLands.length === 0) {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
          setErrorMessagePopupMessage('No Hero may be spared for Quest.');
          setShowErrorMessagePopup(true);
        }
      } else {
        setSelectedLandAction('Quest');
        // Add glowing to all quest lands
        questLands.forEach((land) => addGlowingTile(getLandId(land)));
      }
    },
    [
      gameState,
      clearAllGlow,
      setErrorMessagePopupMessage,
      setShowErrorMessagePopup,
      setSelectedLandAction,
      addGlowingTile,
    ]
  );

  const handleShowMoveAmyDialog = useCallback(
    (event: React.MouseEvent) => {
      if (!gameState) return;

      clearAllGlow();
      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();

      // Get all lands owned by current player that have a non-moving army
      const armyLands = getArmiesByPlayer(gameState)
        .filter((army) => !isMoving(army))
        .flatMap(getPosition);

      if (armyLands.length === 0) {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
          setErrorMessagePopupMessage('No armies are ready to march.');
          setShowErrorMessagePopup(true);
        }
      } else {
        setSelectedLandAction('MoveArmyFrom');
        // Add glowing to all army lands
        armyLands.forEach((land) => {
          const tileId = getLandId(land);
          addGlowingTile(tileId);
        });
      }
    },
    [
      addGlowingTile,
      clearAllGlow,
      gameState,
      setErrorMessagePopupMessage,
      setSelectedLandAction,
      setShowErrorMessagePopup,
    ]
  );

  const isHuman = gameState ? getTurnOwner(gameState).playerType === 'human' : false;

  return (
    <Activity mode={isHuman ? 'visible' : 'hidden'}>
      <div className={styles.gameControlContainer} data-testid="game-control-container">
        <GameButton buttonName={ButtonName.RECRUIT} onClick={handleShowRecruitArmyDialog} />
        <GameButton buttonName={ButtonName.MOVE} onClick={handleShowMoveAmyDialog} />
        <GameButton buttonName={ButtonName.QUEST} onClick={handleShowSendHeroInQuestDialog} />
      </div>
    </Activity>
  );
};

export default UnitActionControl;
