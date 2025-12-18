import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import GameButton from '../buttons/GameButton';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import { getLandId } from '../../state/map/land/LandId';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import {
  getPosition,
  isMoving,
  findAllHeroesOnMap,
  getArmiesByPlayer,
} from '../../selectors/armySelectors';
import { hasAvailableSlot } from '../../factories/buildingFactory';

import { ButtonName } from '../../types/ButtonName';

const UnitActionControl: React.FC = () => {
  const { addGlowingTile, clearAllGlow, setSelectedLandAction } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowRecruitArmyDialog = useCallback(
    (event: React.MouseEvent) => {
      if (!gameState) return;

      clearAllGlow();

      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();

      // Get all lands owned by current player with BARRACKS or Mage Towers that have available slots
      const recruitmentLands = getPlayerLands(gameState).filter((l) =>
        l.buildings.some((b) => hasAvailableSlot(b))
      );

      setSelectedLandAction('Recruit');
      // Add glowing to all recruitment lands
      recruitmentLands.forEach((land) => {
        const tileId = getLandId(land.mapPos);
        addGlowingTile(tileId);
      });
    },
    [gameState, clearAllGlow, setSelectedLandAction, addGlowingTile]
  );

  const handleShowSendHeroInQuestDialog = useCallback(
    (event: React.MouseEvent) => {
      if (!gameState) return;

      clearAllGlow();

      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();

      // Get all lands owned by current player that have heroes
      const questLands = findAllHeroesOnMap(gameState).map((r) => r.position);

      setSelectedLandAction('Quest');
      // Add glowing to all quest lands
      questLands.forEach((land) => addGlowingTile(getLandId(land)));
    },
    [gameState, clearAllGlow, setSelectedLandAction, addGlowingTile]
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

      setSelectedLandAction('MoveArmyFrom');
      // Add glowing to all army lands
      armyLands.forEach((land) => {
        const tileId = getLandId(land);
        addGlowingTile(tileId);
      });
    },
    [addGlowingTile, clearAllGlow, gameState, setSelectedLandAction]
  );

  if (gameState == null || getTurnOwner(gameState).playerType !== 'human') return null;

  return (
    <div className={styles.gameControlContainer} data-testid="game-control-container">
      <GameButton buttonName={ButtonName.RECRUIT} onClick={handleShowRecruitArmyDialog} />
      <GameButton buttonName={ButtonName.MOVE} onClick={handleShowMoveAmyDialog} />
      <GameButton buttonName={ButtonName.QUEST} onClick={handleShowSendHeroInQuestDialog} />
    </div>
  );
};

export default UnitActionControl;
