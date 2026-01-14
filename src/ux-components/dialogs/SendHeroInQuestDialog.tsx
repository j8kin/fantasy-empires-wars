import React, { useCallback, useState, useEffect } from 'react';

import FlipBook from '../fantasy-book-dialog-template/FlipBook';
import FlipBookPage from '../fantasy-book-dialog-template/FlipBookPage';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { getAllQuests, getQuestType } from '../../domain/quest/questRepository';
import { startQuest } from '../../map/quest/startQuest';

import { getQuestImg } from '../../assets/getQuestImg';

import type { Slot } from '../fantasy-book-dialog-template/FlipBookPage';
import type { HeroState } from '../../state/army/HeroState';

const SendHeroInQuestDialog: React.FC = () => {
  const { showSendHeroInQuestDialog, setShowSendHeroInQuestDialog, setActionLandPosition, actionLandPosition } =
    useApplicationContext();
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

    const armiesAtPosition = getArmiesAtPosition(gameState, actionLandPosition);
    if (armiesAtPosition.length === 0) {
      handleClose();
      return;
    }

    const availableUnits = armiesAtPosition.flatMap((armyUnit) => armyUnit.heroes);

    if (availableUnits.length === 0) {
      handleClose();
    }
  }, [gameState, showSendHeroInQuestDialog, actionLandPosition, handleClose]);

  const createSlotClickHandler = useCallback(
    (questLvl: number) => {
      return (slot: Slot) => {
        // slot.id contain uniq Hero name, and slot name contains what is displayed in the dialog, e.g. "Alaric Lvl: 1"
        startQuest(gameState!, slot.id, getQuestType(questLvl + 1));
        // Mark the slot as used across all pages
        setUsedSlots((prev) => new Set(prev).add(slot.id));
      };
    },
    [gameState]
  );

  const createQuestClickHandler = useCallback(
    (questLvl: number, units: HeroState[]) => {
      return () => {
        units.forEach((hero) => startQuest(gameState!, hero.name, getQuestType(questLvl + 1)));
        handleClose();
      };
    },
    [gameState, handleClose]
  );

  if (!showSendHeroInQuestDialog || actionLandPosition == null || gameState == null) return null;

  const availableUnits = getArmiesAtPosition(gameState, actionLandPosition).flatMap((armyUnit) => armyUnit.heroes);

  const slots: Slot[] = availableUnits.map((hero) => ({
    id: hero.name,
    name: `${hero.name.split(' ')[0]} Lvl: ${hero.level}`,
  }));

  if (slots.length === 0) return null;

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
