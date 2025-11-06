import React, { useCallback } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { FlipBookPageType, Slot } from '../fantasy-book-dialog-template/FlipBookPage';

import { getLands } from '../../map/utils/getLands';
import { getTurnOwner } from '../../types/GameState';
import { HeroUnit, isHero } from '../../types/Army';
import { findHeroByName } from '../../map/utils/findHeroByName';
import { startQuest } from '../../map/quest/startQuest';
import { getAllQuests, getQuestType } from '../../types/Quest';

import { getQuestImg } from '../../assets/getQuestImg';

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
          // Note: slot removal and dialog closing is now handled by FlipBookPage
        }
      };
    },
    [gameState]
  );

  const createQuestClickHandler = useCallback(
    (questLvl: number, units: HeroUnit[]) => {
      return () => {
        units.forEach((hero) => startQuest(hero, getQuestType(questLvl + 1), gameState!));
        handleClose();
      };
    },
    [gameState, handleClose]
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
      {getAllQuests().map((quest, index) => (
        <FlipBookPage
          dialogType={FlipBookPageType.RECRUIT}
          key={quest.id}
          pageNum={index}
          header={quest.id}
          iconPath={getQuestImg(quest.id)}
          description={quest.description}
          onClose={handleClose}
          slots={slots}
          onSlotClick={createSlotClickHandler(index)}
          onIconClick={createQuestClickHandler(index, availableUnits)}
        />
      ))}
    </FlipBook>
  );
};

export default SendHeroInQuest;
