import React, { useCallback } from 'react';
import styles from './css/GameControl.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import { ButtonName } from '../../types/ButtonName';
import GameButton from '../buttons/GameButton';
import { getLands } from '../../map/utils/getLands';
import { getTurnOwner, battlefieldLandId } from '../../types/GameState';
import { BuildingType } from '../../types/Building';

const UnitActionControl: React.FC = () => {
  const { setShowSendHeroInQuestDialog, addGlowingTile, setSelectedLandAction } =
    useApplicationContext();
  const { gameState } = useGameContext();

  const handleShowRecruitArmyDialog = useCallback(
    (event: React.MouseEvent) => {
      if (!gameState) return;

      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();

      // Get all lands owned by current player with BARRACKS or Mage Towers
      const recruitmentLands = getLands({
        lands: gameState.battlefield.lands,
        players: [getTurnOwner(gameState)!],
        buildings: [
          BuildingType.BARRACKS,
          BuildingType.WHITE_MAGE_TOWER,
          BuildingType.BLACK_MAGE_TOWER,
          BuildingType.BLUE_MAGE_TOWER,
          BuildingType.GREEN_MAGE_TOWER,
          BuildingType.RED_MAGE_TOWER,
        ],
      }).filter((land) => {
        // Only show lands with buildings that have available slots
        return land.buildings.some(
          (building) =>
            building.numberOfSlots > 0 && building.slots!.length < building.numberOfSlots
        );
      });
      console.log(
        `Number of lands: ${recruitmentLands.length} positions: ${recruitmentLands.map((land) => battlefieldLandId(land.mapPos))}`
      );

      // Set selected land action to 'Recruit'
      setSelectedLandAction('Recruit');
      // Add glowing to all recruitment lands
      recruitmentLands.forEach((land) => {
        console.log(`Glowing tile: ${battlefieldLandId(land.mapPos)}`);
        const tileId = battlefieldLandId(land.mapPos);
        addGlowingTile(tileId);
      });
    },
    [gameState, addGlowingTile, setSelectedLandAction]
  );

  const handleShowSendHeroInQuestDialog = useCallback(
    (event: React.MouseEvent) => {
      // Prevent event bubbling to parent elements (MainView)
      event.stopPropagation();
      setShowSendHeroInQuestDialog(true);
    },
    [setShowSendHeroInQuestDialog]
  );

  return (
    <div className={styles.gameControlContainer}>
      <GameButton buttonName={ButtonName.RECRUIT} onClick={handleShowRecruitArmyDialog} />
      <GameButton buttonName={ButtonName.MOVE} />
      <GameButton buttonName={ButtonName.QUEST} onClick={handleShowSendHeroInQuestDialog} />
    </div>
  );
};

export default UnitActionControl;
