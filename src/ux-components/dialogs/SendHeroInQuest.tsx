import React, { useCallback } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageType, Slot } from '../fantasy-book-dialog-template/FlipBookPage';
import { getUnitImg } from '../../assets/getUnitImg';
import { getLands } from '../../map/utils/getLands';
import { getTurnOwner } from '../../types/GameState';
import { findHeroByName, HeroUnit, isHero } from '../../types/Army';
import { startQuest } from '../../map/quest/startQuest';
import { getQuestType } from '../../map/quest/Quest';

const SendHeroInQuest: React.FC = () => {
  const { showSendHeroInQuestDialog, setShowSendHeroInQuestDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  const handleClose = useCallback(() => {
    setShowSendHeroInQuestDialog(false);
  }, [setShowSendHeroInQuestDialog]);

  const createSlotClickHandler = useCallback(
    (questLvl: number) => {
      return (slot: Slot) => {
        const hero = findHeroByName(slot.name, gameState!);
        if (hero) {
          startQuest(hero, getQuestType(questLvl), gameState!);
        }
      };
    },
    [gameState]
  );

  if (!gameState || !showSendHeroInQuestDialog) return undefined;

  // todo should be an input parameter
  const land = getLands({
    lands: gameState!.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    noArmy: false,
  }).filter((l) => l.army.length > 0 && l.army.some((u) => isHero(u.unit)))[0];

  const availableUnits = land.army
    .filter((armyUnit) => isHero(armyUnit.unit))
    .map((armyUnit) => armyUnit.unit as HeroUnit);

  const slots: Slot[] = availableUnits.map((hero) => ({ id: hero.id, name: hero.name }));

  return (
    <FlipBook onClickOutside={handleClose}>
      {availableUnits.map((unit, index) => (
        <FlipBookPage
          dialogType={FlipBookPageType.RECRUIT}
          key={unit.id}
          pageNum={index}
          header={unit.id}
          iconPath={getUnitImg(unit.id)}
          description={unit.description}
          cost={unit.recruitCost}
          onClose={handleClose}
          slots={slots}
          landId={land.mapPos}
          onSlotClick={createSlotClickHandler(index)}
        />
      ))}
    </FlipBook>
  );
};

export default SendHeroInQuest;
