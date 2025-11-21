import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import GameButton from '../buttons/GameButton';

import { getTurnOwner } from '../../state/GameState';
import { getLandId } from '../../state/LandState';

import { ButtonName } from '../../types/ButtonName';
import { BuildingType } from '../../types/Building';
import { isHero } from '../../types/Army';

import { getLands } from '../../map/utils/getLands';

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
      const recruitmentLands = (
        getLands({
          gameState: gameState,
          players: [gameState.turnOwner],
          buildings: [
            BuildingType.BARRACKS,
            BuildingType.WHITE_MAGE_TOWER,
            BuildingType.BLACK_MAGE_TOWER,
            BuildingType.BLUE_MAGE_TOWER,
            BuildingType.GREEN_MAGE_TOWER,
            BuildingType.RED_MAGE_TOWER,
          ],
        }) || []
      ).filter((land) => {
        // Only show lands with buildings that have available slots
        return land.buildings.some(
          (building) =>
            building.numberOfSlots > 0 && building.slots!.length < building.numberOfSlots
        );
      });

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
      const questLands = (
        getLands({
          gameState: gameState,
          players: [gameState.turnOwner],
          noArmy: false,
        }) || []
      ).filter((l) =>
        l.army.some((u) => u.movements == null && u.units.some((unit) => isHero(unit)))
      );

      setSelectedLandAction('Quest');
      // Add glowing to all quest lands
      questLands.forEach((land) => {
        const tileId = getLandId(land.mapPos);
        addGlowingTile(tileId);
      });
    },
    [gameState, clearAllGlow, setSelectedLandAction, addGlowingTile]
  );

  const handleShowMoveAmyDialog = useCallback(
    (event: React.MouseEvent) => {
      if (!gameState) return;

      clearAllGlow();
      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();

      // Get all lands owned by current player that have army
      // todo probably for change order we should get all lands with army owned by current player
      const armyLands = (
        getLands({
          gameState: gameState,
          players: [gameState.turnOwner],
          noArmy: false,
        }) || []
      ).filter((l) => l.army.some((a) => a.movements == null));

      setSelectedLandAction('MoveArmyFrom');
      // Add glowing to all army lands
      armyLands.forEach((land) => {
        const tileId = getLandId(land.mapPos);
        addGlowingTile(tileId);
      });
    },
    [addGlowingTile, clearAllGlow, gameState, setSelectedLandAction]
  );

  if (getTurnOwner(gameState)?.playerType !== 'human') return null;

  return (
    <div className={styles.gameControlContainer} data-testid="game-control-container">
      <GameButton buttonName={ButtonName.RECRUIT} onClick={handleShowRecruitArmyDialog} />
      <GameButton buttonName={ButtonName.MOVE} onClick={handleShowMoveAmyDialog} />
      <GameButton buttonName={ButtonName.QUEST} onClick={handleShowSendHeroInQuestDialog} />
    </div>
  );
};

export default UnitActionControl;
