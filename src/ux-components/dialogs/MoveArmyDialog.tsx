import React, { useEffect, useRef, useState } from 'react';
import styles from './css/MoveArmyDialog.module.css';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { briefInfo, getArmiesAtPosition, isMoving } from '../../selectors/armySelectors';
import { getLandOwner } from '../../selectors/landSelectors';
import { getDiplomacyStatus, getPlayer } from '../../selectors/playerSelectors';
import { getRandomElement } from '../../domain/utils/random';
import { startMovement } from '../../map/move-army/startMovement';
import { ButtonName } from '../../types/ButtonName';
import { UnitRank } from '../../state/army/RegularsState';
import { DiplomacyStatus } from '../../types/Diplomacy';
import type { ArmyBriefInfo, HeroBriefInfo, RegularsBriefInfo, WarMachinesBriefInfo } from '../../state/army/ArmyState';
import type { HeroUnitType, RegularUnitType, WarMachineType } from '../../types/UnitType';
import type { UnitRankType } from '../../state/army/RegularsState';
import { EmpireEventKind } from '../../types/EmpireEvent';

// Consolidate units of the same type and rank
const consolidateArmyBriefInfo = (army: ArmyBriefInfo): ArmyBriefInfo => {
  // Heroes don't need consolidation as they are unique
  const consolidatedHeroes = [...army.heroes];

  // Consolidate regulars by type and rank
  const consolidatedRegulars: { id: RegularUnitType; rank: UnitRankType; count: number }[] = [];

  army.regulars.forEach((unit) => {
    const existingIdx = consolidatedRegulars.findIndex((u) => u.id === unit.id && u.rank === unit.rank);

    if (existingIdx !== -1) {
      // Merge with existing unit
      consolidatedRegulars[existingIdx] = {
        ...consolidatedRegulars[existingIdx],
        count: consolidatedRegulars[existingIdx].count + unit.count,
      };
    } else {
      // Add new unit
      consolidatedRegulars.push({ ...unit });
    }
  });

  // Consolidate war machines by type
  const consolidatedWarMachines: { type: WarMachineType; count: number; durability: number }[] = [];

  army.warMachines.forEach((unit) => {
    const existingIdx = consolidatedWarMachines.findIndex((u) => u.type === unit.type);

    if (existingIdx !== -1) {
      // Merge with existing unit
      consolidatedWarMachines[existingIdx] = {
        ...consolidatedWarMachines[existingIdx],
        count: consolidatedWarMachines[existingIdx].count + unit.count,
      };
    } else {
      // Add new unit
      consolidatedWarMachines.push({ ...unit });
    }
  });

  return {
    heroes: consolidatedHeroes,
    regulars: consolidatedRegulars,
    warMachines: consolidatedWarMachines,
  };
};

const brakeTreatyMessage = (opponentName: string): string => {
  return `WAR Declared:\n${getRandomElement([
    `${opponentName} trusted you. That trust now bleeds across their borders.`,
    `Oaths to ${opponentName} were worth less than ash.`,
    `You betray ${opponentName} without warning. Chaos approves.`,
    `The treaty with ${opponentName} shatters beneath marching boots.`,
    `${opponentName} called you ally—now they call for war.`,
    `No honor binds you to ${opponentName}. Only conquest.`,
    `${opponentName} was promised peace. You delivered war.`,
    `A dagger in ${opponentName}’s back marks the birth of this war.`,
    `Chaos laughs as you turn on ${opponentName}.`,
    `Your word to ${opponentName} dies as your armies cross their land.`,
  ])}`;
};

const MoveArmyDialog: React.FC = () => {
  const { setMoveArmyPath, moveArmyPath, showEmpireEvents } = useApplicationContext();
  const { gameState, updateGameState } = useGameContext();

  const fromUnitsRef = useRef<ArmyBriefInfo | undefined>(undefined);
  const toUnitsRef = useRef<ArmyBriefInfo | undefined>(undefined);
  const [, forceUpdate] = useState({});

  // Force component re-render
  const triggerUpdate = () => forceUpdate(Math.random());

  // Refs for click-and-hold functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!moveArmyPath || !gameState) {
      fromUnitsRef.current = undefined;
      toUnitsRef.current = undefined;
      triggerUpdate();
      return;
    }

    const stationedArmy = getArmiesAtPosition(gameState, moveArmyPath.from).filter((a) => !isMoving(a));

    if (stationedArmy == null || stationedArmy.length === 0) {
      fromUnitsRef.current = undefined;
      toUnitsRef.current = undefined;
      triggerUpdate();
      return;
    }

    // Initialize using refs - completely bypass React state
    // Combine all units from all stationed armies on the land
    fromUnitsRef.current = {
      heroes: stationedArmy.flatMap((a) => briefInfo(a).heroes),
      regulars: stationedArmy.flatMap((a) => briefInfo(a).regulars),
      warMachines: stationedArmy.flatMap((a) => briefInfo(a).warMachines),
    };
    toUnitsRef.current = undefined;
    triggerUpdate();
  }, [moveArmyPath, gameState]);

  // Create stable references for the current values
  const fromUnits = fromUnitsRef.current;
  const toUnits = toUnitsRef.current;

  // Helper functions to update refs and trigger re-render
  const updateFromUnits = (units?: ArmyBriefInfo) => {
    fromUnitsRef.current = units;
    triggerUpdate();
  };

  const updateToUnits = (units?: ArmyBriefInfo) => {
    toUnitsRef.current = units;
    triggerUpdate();
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!moveArmyPath || !gameState) return null;

  const stationedArmy = getArmiesAtPosition(gameState, moveArmyPath.from).filter((a) => !isMoving(a));

  if (stationedArmy == null || stationedArmy.length === 0) return null;

  const handleMove = () => {
    if (!moveArmyPath || !toUnits) return;
    const toOwner = getLandOwner(gameState, moveArmyPath.to);
    const isWar = getDiplomacyStatus(gameState, gameState!.turnOwner, toOwner) === DiplomacyStatus.WAR;

    const newGameState = startMovement(gameState, moveArmyPath.from, moveArmyPath.to, toUnits);
    setMoveArmyPath(undefined);

    if (!isWar && getDiplomacyStatus(newGameState, newGameState?.turnOwner, toOwner) === DiplomacyStatus.WAR) {
      showEmpireEvents([
        {
          status: EmpireEventKind.Negative,
          message: brakeTreatyMessage(getPlayer(newGameState, toOwner).playerProfile.name),
        },
      ]);
    }

    updateGameState(newGameState);
  };

  const handleClose = () => {
    setMoveArmyPath(undefined);
  };

  // Helper function to get unit CSS class based on type and rank
  const getUnitColorClass = (rank: UnitRankType): string => {
    switch (rank) {
      case UnitRank.REGULAR:
        return styles.regularUnit;
      case UnitRank.VETERAN:
        return styles.veteranUnit;
      case UnitRank.ELITE:
        return styles.eliteUnit;
    }
  };

  // Transfer functions
  const moveAll = (direction: 'left' | 'right') => {
    const newToUnits: ArmyBriefInfo = {
      heroes: [...(toUnits?.heroes ?? []), ...(fromUnits?.heroes ?? [])],
      regulars: [...(toUnits?.regulars ?? []), ...(fromUnits?.regulars ?? [])],
      warMachines: [...(toUnits?.warMachines ?? []), ...(fromUnits?.warMachines ?? [])],
    };

    // Consolidate units of the same type and rank
    const consolidatedUnits = consolidateArmyBriefInfo(newToUnits);

    updateToUnits(direction === 'right' ? consolidatedUnits : undefined);
    updateFromUnits(direction === 'right' ? undefined : consolidatedUnits);
  };

  const moveHalf = (direction: 'left' | 'right') => {
    // Determine source and destination based on direction
    const sourceUnits = direction === 'right' ? fromUnits : toUnits;
    const destinationUnits = direction === 'right' ? toUnits : fromUnits;

    // Units to move (including all heroes from source)
    const unitsToMove: ArmyBriefInfo = {
      heroes: [...(sourceUnits?.heroes ?? [])],
      regulars: [],
      warMachines: [],
    };

    // Units remaining in source
    const remainingUnits: ArmyBriefInfo = {
      heroes: [], // Heroes move completely
      regulars: [],
      warMachines: [],
    };

    // Handle regulars - split them in half
    sourceUnits?.regulars?.forEach((unit) => {
      const halfCount = Math.ceil(unit.count / 2);
      if (halfCount === unit.count) {
        // Move entire unit if it can't be split
        unitsToMove.regulars.push(unit);
      } else {
        // Split the unit
        unitsToMove.regulars.push({ ...unit, count: halfCount });
        remainingUnits.regulars.push({ ...unit, count: unit.count - halfCount });
      }
    });

    // Handle war machines - split them in half
    sourceUnits?.warMachines?.forEach((unit) => {
      const halfCount = Math.ceil(unit.count / 2);
      if (halfCount === unit.count) {
        // Move entire unit if it can't be split
        unitsToMove.warMachines.push(unit);
      } else {
        // Split the unit
        unitsToMove.warMachines.push({ ...unit, count: halfCount });
        remainingUnits.warMachines.push({ ...unit, count: unit.count - halfCount });
      }
    });

    // Combine moved units with existing destination units
    const newDestination: ArmyBriefInfo = {
      heroes: [...(destinationUnits?.heroes ?? []), ...unitsToMove.heroes],
      regulars: [...(destinationUnits?.regulars ?? []), ...unitsToMove.regulars],
      warMachines: [...(destinationUnits?.warMachines ?? []), ...unitsToMove.warMachines],
    };

    // Consolidate units of the same type and rank
    const consolidatedDestination = consolidateArmyBriefInfo(newDestination);
    const consolidatedRemaining = consolidateArmyBriefInfo(remainingUnits);

    // Update the refs based on direction
    if (direction === 'right') {
      updateFromUnits(consolidatedRemaining);
      updateToUnits(consolidatedDestination);
    } else {
      updateToUnits(consolidatedRemaining);
      updateFromUnits(consolidatedDestination);
    }
  };

  const moveOneUnit = (
    fromArray: ArmyBriefInfo,
    toArray: ArmyBriefInfo,
    unitIndex: number,
    type: 'hero' | 'regular' | 'warMachine',
    direction: 'right' | 'left'
  ) => {
    if (type === 'hero') {
      const unit = fromArray.heroes[unitIndex];
      if (!unit) return;

      // Move hero
      const newFromHeroes = fromArray.heroes.filter((_, index) => index !== unitIndex);
      const newToHeroes = [...toArray.heroes, unit];

      const newFrom = { ...fromArray, heroes: newFromHeroes };
      const newTo = { ...toArray, heroes: newToHeroes };

      if (direction === 'right') {
        updateFromUnits(newFrom);
        updateToUnits(newTo);
      } else {
        updateToUnits(newFrom);
        updateFromUnits(newTo);
      }
    } else if (type === 'regular') {
      const regularUnit = fromArray.regulars[unitIndex];
      if (!regularUnit) return;

      // Remove/Decrement from source
      let newFromRegulars;
      if (regularUnit.count === 1) {
        newFromRegulars = fromArray.regulars.filter((_, index) => index !== unitIndex);
      } else {
        newFromRegulars = fromArray.regulars.map((u, index) =>
          index === unitIndex ? { ...u, count: u.count - 1 } : u
        );
      }

      // Add/Increment to destination
      const existingUnitIndex = toArray.regulars.findIndex(
        (u) => u.id === regularUnit.id && u.rank === regularUnit.rank
      );

      let newToRegulars;
      if (existingUnitIndex >= 0) {
        newToRegulars = toArray.regulars.map((u, index) =>
          index === existingUnitIndex ? { ...u, count: u.count + 1 } : u
        );
      } else {
        newToRegulars = [...toArray.regulars, { ...regularUnit, count: 1 }];
      }

      const newFrom = { ...fromArray, regulars: newFromRegulars };
      const newTo = { ...toArray, regulars: newToRegulars };

      if (direction === 'right') {
        updateFromUnits(newFrom);
        updateToUnits(newTo);
      } else {
        updateToUnits(newFrom);
        updateFromUnits(newTo);
      }
    } else if (type === 'warMachine') {
      const warMachineUnit = fromArray.warMachines[unitIndex];
      if (!warMachineUnit) return;

      // Remove/Decrement from source
      let newFromWarMachines;
      if (warMachineUnit.count === 1) {
        newFromWarMachines = fromArray.warMachines.filter((_, index) => index !== unitIndex);
      } else {
        newFromWarMachines = fromArray.warMachines.map((u, index) =>
          index === unitIndex ? { ...u, count: u.count - 1 } : u
        );
      }

      // Add/Increment to destination
      const existingUnitIndex = toArray.warMachines.findIndex((u) => u.type === warMachineUnit.type);

      let newToWarMachines;
      if (existingUnitIndex >= 0) {
        newToWarMachines = toArray.warMachines.map((u, index) =>
          index === existingUnitIndex ? { ...u, count: u.count + 1 } : u
        );
      } else {
        newToWarMachines = [...toArray.warMachines, { ...warMachineUnit, count: 1 }];
      }

      const newFrom = { ...fromArray, warMachines: newFromWarMachines };
      const newTo = { ...toArray, warMachines: newToWarMachines };

      if (direction === 'right') {
        updateFromUnits(newFrom);
        updateToUnits(newTo);
      } else {
        updateToUnits(newFrom);
        updateFromUnits(newTo);
      }
    }
  };

  const handleMouseDown = (
    fromArray: ArmyBriefInfo,
    unitIndex: number,
    type: 'hero' | 'regular' | 'warMachine',
    direction: 'right' | 'left'
  ) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Snapshot the selected unit identity
    const selectedUnit =
      type === 'hero'
        ? fromArray.heroes[unitIndex]
        : type === 'regular'
          ? fromArray.regulars[unitIndex]
          : fromArray.warMachines[unitIndex];

    if (!selectedUnit) return;

    // Move one unit immediately using current refs
    // Initialize toUnitsRef if it's undefined
    if (toUnitsRef.current === undefined) {
      toUnitsRef.current = { heroes: [], regulars: [], warMachines: [] };
    }

    const currentFrom = direction === 'right' ? fromUnitsRef.current : toUnitsRef.current;
    const currentTo = direction === 'right' ? toUnitsRef.current : fromUnitsRef.current;

    const findCurrentIndex = (): number => {
      const arr = direction === 'right' ? fromUnitsRef.current : toUnitsRef.current;
      if (!arr) return -1;

      if (type === 'hero') {
        const heroUnit = selectedUnit as { name: string; type: HeroUnitType; level: number };
        return arr.heroes.findIndex(
          (h) => h.name === heroUnit.name && h.type === heroUnit.type && h.level === heroUnit.level
        );
      } else if (type === 'regular') {
        const reg = selectedUnit as { id: string; rank: UnitRankType };
        return arr.regulars.findIndex((u) => u.id === reg.id && u.rank === reg.rank);
      } else {
        const wm = selectedUnit as { type: WarMachineType };
        return arr.warMachines.findIndex((u) => u.type === wm.type);
      }
    };

    const initialIndex = findCurrentIndex();
    if (currentFrom != null && currentTo != null && initialIndex >= 0) {
      moveOneUnit(currentFrom, currentTo, initialIndex, type, direction);
    }

    // Start interval for continuous movement
    intervalRef.current = setInterval(() => {
      const idx = findCurrentIndex();
      if (idx < 0) {
        // Nothing more to move; stop interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      const liveFrom = direction === 'right' ? fromUnitsRef.current : toUnitsRef.current;
      const liveTo = direction === 'right' ? toUnitsRef.current : fromUnitsRef.current;
      if (!liveFrom || !liveTo) return;
      moveOneUnit(liveFrom, liveTo, idx, type, direction);
    }, 200); // Move one unit every 200ms
  };

  const handleMouseUp = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  // Center the dialog on screen (assuming 1920x1080 viewport)
  const dialogWidth = 730;
  const dialogHeight = 500;
  const x = (window.innerWidth - dialogWidth) / 2;
  const y = (window.innerHeight - dialogHeight) / 2;

  // Unit rendering component
  const renderHeroUnit = (
    hero: HeroBriefInfo,
    index: number,
    fromArray: ArmyBriefInfo,
    direction: 'right' | 'left'
  ) => {
    return (
      <div
        data-testid={`${hero.name}-${index}`}
        key={`${hero.name}-${hero.type}-${hero.level}-${index}`}
        className={`${styles.unitItem} ${styles.heroUnit}`}
        onMouseDown={() => handleMouseDown(fromArray, index, 'hero', direction)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div>
          <div className={styles.unitName}>{hero.name}</div>
          <div className={styles.unitDetails}>
            {hero.type} - Level {hero.level}
          </div>
        </div>
      </div>
    );
  };

  const renderRegularUnit = (
    unit: RegularsBriefInfo,
    index: number,
    fromArray: ArmyBriefInfo,
    direction: 'right' | 'left'
  ) => {
    const colorClass = getUnitColorClass(unit.rank);

    return (
      <div
        data-testid={`${unit.id}-${index}`}
        key={`${unit.id}-${index}`}
        className={`${styles.unitItem} ${colorClass}`}
        onMouseDown={() => handleMouseDown(fromArray, index, 'regular', direction)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div>
          <div className={styles.unitName}>{unit.id}</div>
          <div className={styles.unitDetails}>
            Count: {unit.count} ({unit.rank})
          </div>
        </div>
      </div>
    );
  };

  const renderWarMachineUnit = (
    unit: WarMachinesBriefInfo,
    index: number,
    fromArray: ArmyBriefInfo,
    direction: 'right' | 'left'
  ) => {
    return (
      <div
        data-testid={`${unit.type}-${index}`}
        key={`${unit.type}-${index}`}
        className={`${styles.unitItem} ${styles.warMachineUnit}`}
        onMouseDown={() => handleMouseDown(fromArray, index, 'warMachine', direction)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div>
          <div className={styles.unitName}>{unit.type}</div>
          <div className={styles.unitDetails}>Count: {unit.count}</div>
          <div className={styles.unitDetails}>Durability: {unit.durability}</div>
        </div>
      </div>
    );
  };

  return (
    <div
      data-testid="MoveArmyDialog"
      key={`${moveArmyPath?.from.row}-${moveArmyPath?.from.col}-${moveArmyPath?.to.row}-${moveArmyPath?.to.col}`}
    >
      <FantasyBorderFrame
        screenPosition={{ x, y }}
        frameSize={{ width: dialogWidth, height: dialogHeight }}
        primaryButton={<GameButton buttonName={ButtonName.MOVE} onClick={handleMove} />}
        secondaryButton={<GameButton buttonName={ButtonName.CANCEL} onClick={handleClose} />}
      >
        <div className={styles.container}>
          {/* Title */}
          <div className={styles.title}>Move Army</div>

          {/* Main content area */}
          <div className={styles.mainContent}>
            {/* From panel */}
            <div className={styles.panel} data-testid="available-units-panel">
              <div className={styles.panelTitle}>Available Units</div>
              <div className={styles.panelContent}>
                {fromUnits == null ? (
                  <div className={styles.emptyMessage}>No units selected</div>
                ) : (
                  <>
                    {fromUnits.heroes.map((hero, index) => renderHeroUnit(hero, index, fromUnits, 'right'))}
                    {fromUnits.regulars.map((unit, index) => renderRegularUnit(unit, index, fromUnits, 'right'))}
                    {fromUnits.warMachines.map((unit, index) => renderWarMachineUnit(unit, index, fromUnits, 'right'))}
                  </>
                )}
              </div>
            </div>

            {/* Transfer buttons */}
            <div className={styles.transferButtons}>
              <button className={styles.transferButton} onClick={() => moveAll('right')} disabled={fromUnits == null}>
                Move All →
              </button>

              <button className={styles.transferButton} onClick={() => moveHalf('right')} disabled={fromUnits == null}>
                Move Half →
              </button>

              <button className={styles.transferButton} onClick={() => moveHalf('left')} disabled={toUnits == null}>
                ← Move Half
              </button>

              <button className={styles.transferButton} onClick={() => moveAll('left')} disabled={toUnits == null}>
                ← Move All
              </button>
            </div>

            {/* To panel */}
            <div className={styles.panel} data-testid="units-to-move-panel">
              <div className={styles.panelTitle}>Units to Move</div>
              <div className={styles.panelContent}>
                {toUnits == null ? (
                  <div className={styles.emptyMessage}>No units selected</div>
                ) : (
                  <>
                    {toUnits.heroes.map((hero, index) => renderHeroUnit(hero, index, toUnits, 'left'))}
                    {toUnits.regulars.map((unit, index) => renderRegularUnit(unit, index, toUnits, 'left'))}
                    {toUnits.warMachines.map((unit, index) => renderWarMachineUnit(unit, index, toUnits, 'left'))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </FantasyBorderFrame>
    </div>
  );
};

export default MoveArmyDialog;
