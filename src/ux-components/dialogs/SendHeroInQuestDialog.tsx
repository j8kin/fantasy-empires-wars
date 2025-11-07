import React, { useCallback, useState, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { Slot } from '../fantasy-book-dialog-template/FlipBookPage';

import { getLands } from '../../map/utils/getLands';
import { getTurnOwner } from '../../types/GameState';
import { HeroUnit, isHero } from '../../types/Army';
import { findHeroByName } from '../../map/utils/findHeroByName';
import { startQuest } from '../../map/quest/startQuest';
import { getAllQuests, getQuestType } from '../../types/Quest';

import { getQuestImg } from '../../assets/getQuestImg';

const SendHeroInQuestDialog: React.FC = () => {
  const { showSendHeroInQuestDialog, setShowSendHeroInQuestDialog } = useApplicationContext();
  const { gameState } = useGameContext();

  // Shared state to track used slots across all pages
  const [usedSlots, setUsedSlots] = useState<Set<string>>(new Set());

  const handleClose = useCallback(() => {
    setShowSendHeroInQuestDialog(false);
    // Reset used slots when dialog closes
    setUsedSlots(new Set());
  }, [setShowSendHeroInQuestDialog]);

  // Use effect to close dialog when no heroes are available (moved from render to avoid state update during render)
  useEffect(() => {
    if (!gameState || !showSendHeroInQuestDialog) return;

    const land = getLands({
      lands: gameState.battlefield.lands,
      players: [getTurnOwner(gameState)!],
      noArmy: false,
    }).filter((l) => l.army.length > 0 && l.army.some((u) => isHero(u.unit)))[0];

    if (!land) return;

    const availableUnits = land.army
      .filter((armyUnit) => isHero(armyUnit.unit))
      .map((armyUnit) => armyUnit.unit as HeroUnit);

    if (availableUnits.length === 0 && showSendHeroInQuestDialog) {
      handleClose();
    }
  }, [gameState, showSendHeroInQuestDialog, handleClose]);

  const createSlotClickHandler = useCallback(
    (questLvl: number) => {
      return (slot: Slot) => {
        // slot.id contain uniq Hero name, and slot name contains what is displayed in the dialog, e.g. "Alaric Lvl: 1"
        const hero = findHeroByName(slot.id, gameState!);
        if (hero) {
          startQuest(hero, getQuestType(questLvl + 1), gameState!);
          // Mark the slot as used across all pages
          setUsedSlots((prev) => new Set(prev).add(slot.id));
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

  // If no land with heroes is available, don't render content
  if (!land) {
    return null;
  }

  const availableUnits = land.army
    .filter((armyUnit) => isHero(armyUnit.unit))
    .map((armyUnit) => armyUnit.unit as HeroUnit);

  // If no heroes are available, don't render content
  if (availableUnits.length === 0) {
    return null;
  }

  const slots: Slot[] = availableUnits.map((hero) => ({
    id: hero.name,
    name: `${hero.name.split(' ')[0]} Lvl: ${hero.level}`,
  }));

  return (
    <FlipBook onClickOutside={handleClose}>
      {getAllQuests().map((quest, questLevel) => (
        <FlipBookPage
          key={quest.id}
          pageNum={questLevel}
          lorePage={1417}
          header={quest.id}
          iconPath={getQuestImg(quest.id)}
          description={quest.description}
          onClose={handleClose}
          slots={slots}
          onSlotClick={createSlotClickHandler(questLevel)}
          onIconClick={createQuestClickHandler(questLevel, availableUnits)}
          usedSlots={usedSlots}
        />
      ))}
    </FlipBook>
  );
};

export default SendHeroInQuestDialog;
