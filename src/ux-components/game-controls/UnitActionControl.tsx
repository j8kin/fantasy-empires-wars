import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import GameButton from '../buttons/GameButton';

import { ButtonName } from '../../types/ButtonName';

import { getPosition, isMoving } from '../../selectors/armySelectors';
import { getLandId } from '../../state/map/land/LandId';
import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { findAllHeroesOnMap, getArmiesByPlayer } from '../../map/utils/armyUtils';

const UnitActionControl: React.FC = () => {
  const { addGlowingTile, clearAllGlow, setSelectedLandAction } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowRecruitArmyDialog = useCallback(
    (event: React.MouseEvent) => {
      if (!gameState) return;

      clearAllGlow();

      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();

      // Get all lands owned by current player with BARRACKS or Mage Towers
      const recruitmentLands = getPlayerLands(gameState).filter((l) =>
        l.buildings.some((b) => b.slots && b.numberOfSlots > 0 && b.slots.length < b.numberOfSlots)
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
