import React, { useCallback, useState, useEffect } from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage, { Slot } from '../fantasy-book-dialog-template/FlipBookPage';

import { getLandId } from '../../types/GameState';
import { HeroUnit, isHero } from '../../types/Army';
import { findHeroByName } from '../../map/utils/findHeroByName';
import { startQuest } from '../../map/quest/startQuest';
import { getAllQuests, getQuestType } from '../../types/Quest';

import { getQuestImg } from '../../assets/getQuestImg';

const SendHeroInQuestDialog: React.FC = () => {
  const {
    showSendHeroInQuestDialog,
    setShowSendHeroInQuestDialog,
    setActionLandPosition,
    actionLandPosition,
  } = useApplicationContext();
  const { gameState } = useGameContext();

  // Shared state to track used slots across all pages
  const [usedSlots, setUsedSlots] = useState<Set<string>>(new Set());

  const handleClose = useCallback(() => {
    setShowSendHeroInQuestDialog(false);
    // Reset used slots when dialog closes
    setUsedSlots(new Set());
    // Reset action land position when dialog closes
    setActionLandPosition(undefined);
  }, [setShowSendHeroInQuestDialog, setActionLandPosition]);

  // Use effect to close dialog when no heroes are available (moved from render to avoid state update during render)
  useEffect(() => {
    if (!gameState || !showSendHeroInQuestDialog || !actionLandPosition) return;

    const land = gameState.battlefield.lands[getLandId(actionLandPosition)];
    if (!land || land.army.length === 0) {
      handleClose();
      return;
    }

    const availableUnits = land.army
      .flatMap((armyUnit) => armyUnit.units.filter((unit) => isHero(unit)))
      .map((unit) => unit as HeroUnit);

    if (availableUnits.length === 0) {
      handleClose();
    }
  }, [gameState, showSendHeroInQuestDialog, actionLandPosition, handleClose]);

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

  if (!gameState || !showSendHeroInQuestDialog || !actionLandPosition) return undefined;

  const land = gameState.battlefield.lands[getLandId(actionLandPosition)];

  // If no land with heroes is available, don't render content
  if (!land || land.army.length === 0) {
    return null;
  }

  const availableUnits = land.army
    .flatMap((armyUnit) => armyUnit.units.filter((unit) => isHero(unit)))
    .map((unit) => unit as HeroUnit);

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
