import React, { useRef, useState } from 'react';
import styles from './css/MoveArmyDialog.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import { getArmiesAtPosition } from '../../map/utils/armyUtils';
import { briefInfo, isMoving } from '../../selectors/armySelectors';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';

import { ButtonName } from '../../types/ButtonName';
import { UnitRank } from '../../state/army/RegularsState';
import { ArmyBriefInfo } from '../../state/army/ArmyState';
import { HeroUnitType } from '../../types/UnitType';

import { startMovement } from '../../map/move-army/startMovement';

const MoveArmyDialog: React.FC = () => {
  const { setMoveArmyPath, moveArmyPath } = useApplicationContext();
  const { gameState } = useGameContext();

  const fromUnitsRef = useRef<ArmyBriefInfo | undefined>(undefined);
  const toUnitsRef = useRef<ArmyBriefInfo | undefined>(undefined);
  const [, forceUpdate] = useState({});

  // Force component re-render
  const triggerUpdate = () => forceUpdate({});

  // Refs for click-and-hold functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!moveArmyPath || !gameState) {
      fromUnitsRef.current = undefined;
      toUnitsRef.current = undefined;
      triggerUpdate();
      return;
    }

    const stationedArmy = getArmiesAtPosition(gameState, moveArmyPath.from).filter(
      (a) => !isMoving(a)
    );

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
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!moveArmyPath || !gameState) return null;

  const stationedArmy = getArmiesAtPosition(gameState, moveArmyPath.from).filter(
    (a) => !isMoving(a)
  );

  if (stationedArmy == null || stationedArmy.length === 0) return null;

  const handleMove = () => {
    if (!moveArmyPath || !toUnits) return;

    startMovement(moveArmyPath.from, moveArmyPath.to, toUnits, gameState);
    setMoveArmyPath(undefined);
  };

  const handleClose = () => {
    setMoveArmyPath(undefined);
  };

  // Helper function to get unit CSS class based on type and rank
  const getUnitColorClass = (rank: UnitRank): string => {
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
    };

    updateToUnits(direction === 'right' ? newToUnits : undefined);
    updateFromUnits(direction === 'right' ? undefined : newToUnits);
  };

  const moveHalf = (direction: 'left' | 'right') => {
    const ArmyBriefInfo: ArmyBriefInfo = { heroes: [...(fromUnits?.heroes ?? [])], regulars: [] };
    const remainingUnits: ArmyBriefInfo = { heroes: [], regulars: [] };

    fromUnits?.regulars?.forEach((unit) => {
      const halfCount = Math.ceil(unit.count / 2);
      if (halfCount === unit.count) {
        ArmyBriefInfo.regulars.push(unit);
      } else {
        ArmyBriefInfo.regulars.push({ ...unit, count: halfCount });
        remainingUnits.regulars.push({ ...unit, count: unit.count - halfCount });
      }
    });

    updateToUnits(direction === 'right' ? ArmyBriefInfo : remainingUnits);
    updateFromUnits(direction === 'right' ? remainingUnits : ArmyBriefInfo);
  };

  const moveOneUnit = (
    fromArray: ArmyBriefInfo,
    toArray: ArmyBriefInfo,
    unitIndex: number,
    type: 'hero' | 'regular',
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
    } else {
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
    }
  };

  const handleMouseDown = (
    fromArray: ArmyBriefInfo,
    unitIndex: number,
    type: 'hero' | 'regular',
    direction: 'right' | 'left'
  ) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Snapshot the selected unit identity
    const selectedUnit =
      type === 'hero' ? fromArray.heroes[unitIndex] : fromArray.regulars[unitIndex];

    if (!selectedUnit) return;

    // Move one unit immediately using current refs
    const currentFrom = direction === 'right' ? fromUnitsRef.current : toUnitsRef.current;
    const currentTo = direction === 'right' ? toUnitsRef.current : fromUnitsRef.current;

    const findCurrentIndex = (): number => {
      const arr = direction === 'right' ? fromUnitsRef.current : toUnitsRef.current;
      if (!arr) return -1;

      if (type === 'hero') {
        return arr.heroes.findIndex((h) => h === selectedUnit);
      } else {
        const reg = selectedUnit as { id: string; rank: UnitRank };
        return arr.regulars.findIndex((u) => u.id === reg.id && u.rank === reg.rank);
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
    hero: { name: string; type: HeroUnitType; level: number },
    index: number,
    fromArray: ArmyBriefInfo,
    direction: 'right' | 'left'
  ) => {
    return (
      <div
        data-testid={`${hero}-${index}`}
        key={`${hero}-${index}`}
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
    unit: { id: string; rank: UnitRank; count: number },
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
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Available Units</div>
              <div className={styles.panelContent}>
                {fromUnits == null ? (
                  <div className={styles.emptyMessage}>No units selected</div>
                ) : (
                  <>
                    {fromUnits.heroes.map((hero, index) =>
                      renderHeroUnit(hero, index, fromUnits, 'right')
                    )}
                    {fromUnits.regulars.map((unit, index) =>
                      renderRegularUnit(unit, index, fromUnits, 'right')
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Transfer buttons */}
            <div className={styles.transferButtons}>
              <button
                className={styles.transferButton}
                onClick={() => moveAll('right')}
                disabled={fromUnits == null}
              >
                Move All →
              </button>

              <button
                className={styles.transferButton}
                onClick={() => moveHalf('right')}
                disabled={fromUnits == null}
              >
                Move Half →
              </button>

              <button
                className={styles.transferButton}
                onClick={() => moveHalf('left')}
                disabled={toUnits == null}
              >
                ← Move Half
              </button>

              <button
                className={styles.transferButton}
                onClick={() => moveAll('left')}
                disabled={toUnits == null}
              >
                ← Move All
              </button>
            </div>

            {/* To panel */}
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Units to Move</div>
              <div className={styles.panelContent}>
                {toUnits == null ? (
                  <div className={styles.emptyMessage}>No units selected</div>
                ) : (
                  <>
                    {toUnits.heroes.map((hero, index) =>
                      renderHeroUnit(hero, index, toUnits, 'left')
                    )}
                    {toUnits.regulars.map((unit, index) =>
                      renderRegularUnit(unit, index, toUnits, 'left')
                    )}
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
