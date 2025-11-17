import React, { useRef, useState } from 'react';
import styles from './css/MoveArmyDialog.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';

import { ButtonName } from '../../types/ButtonName';
import { HeroUnit, isHero, RegularUnit, Unit, UnitRank } from '../../types/Army';
import { getLand } from '../../map/utils/getLands';
import { startMovement } from '../../map/move-army/startMovement';

const MoveArmyDialog: React.FC = () => {
  const { setMoveArmyPath, moveArmyPath } = useApplicationContext();
  const { gameState } = useGameContext();

  const fromUnitsRef = useRef<Unit[]>([]);
  const toUnitsRef = useRef<Unit[]>([]);
  const [, forceUpdate] = useState({});

  // Force component re-render
  const triggerUpdate = () => forceUpdate({});

  // Refs for click-and-hold functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!moveArmyPath || !gameState) {
      fromUnitsRef.current = [];
      toUnitsRef.current = [];
      triggerUpdate();
      return;
    }

    const fromLand = getLand(gameState, moveArmyPath.from);
    const stationedArmy = fromLand.army.filter((a) => a.movements == null);

    if (stationedArmy == null || stationedArmy.length === 0) {
      fromUnitsRef.current = [];
      toUnitsRef.current = [];
      triggerUpdate();
      return;
    }

    // Initialize using refs - completely bypass React state
    // Combine all units from all stationed armies on the land
    fromUnitsRef.current = stationedArmy.flatMap((a) => a.units);
    toUnitsRef.current = [];
    triggerUpdate();
  }, [moveArmyPath, gameState]);

  // Create stable references for the current values
  const fromUnits = fromUnitsRef.current;
  const toUnits = toUnitsRef.current;

  // Helper functions to update refs and trigger re-render
  const updateFromUnits = (units: Unit[]) => {
    fromUnitsRef.current = units;
    triggerUpdate();
  };

  const updateToUnits = (units: Unit[]) => {
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

  const stationedArmy = getLand(gameState, moveArmyPath.from).army.filter(
    (a) => a.movements == null
  );

  if (stationedArmy == null || stationedArmy.length === 0) return null;

  const handleMove = () => {
    if (!moveArmyPath) return;

    startMovement(moveArmyPath.from, moveArmyPath.to, toUnits, gameState);
    setMoveArmyPath(undefined);
  };

  const handleClose = () => {
    setMoveArmyPath(undefined);
  };

  // Helper function to get unit CSS class based on type and rank
  const getUnitColorClass = (unit: Unit): string => {
    if (isHero(unit)) {
      return styles.heroUnit;
    }
    const regularUnit = unit as RegularUnit;
    switch (regularUnit.level) {
      case UnitRank.REGULAR:
        return styles.regularUnit;
      case UnitRank.VETERAN:
        return styles.veteranUnit;
      case UnitRank.ELITE:
        return styles.eliteUnit;
    }
  };

  // Transfer functions
  const moveAllToRight = () => {
    updateToUnits([...toUnits, ...fromUnits]);
    updateFromUnits([]);
  };

  const moveAllToLeft = () => {
    updateFromUnits([...fromUnits, ...toUnits]);
    updateToUnits([]);
  };

  const moveHalfToRight = () => {
    const unitsToMove: Unit[] = [];
    const remainingUnits: Unit[] = [];

    fromUnits.forEach((unit) => {
      if (isHero(unit)) {
        unitsToMove.push(unit);
      } else {
        const regularUnit = unit as RegularUnit;
        const halfCount = Math.ceil(regularUnit.count / 2);
        if (halfCount === regularUnit.count) {
          unitsToMove.push(unit);
        } else {
          unitsToMove.push({ ...regularUnit, count: halfCount });
          remainingUnits.push({ ...regularUnit, count: regularUnit.count - halfCount });
        }
      }
    });

    updateToUnits([...toUnits, ...unitsToMove]);
    updateFromUnits(remainingUnits);
  };

  const moveHalfToLeft = () => {
    const unitsToMove: Unit[] = [];
    const remainingUnits: Unit[] = [];

    toUnits.forEach((unit) => {
      if (isHero(unit)) {
        unitsToMove.push(unit);
      } else {
        const regularUnit = unit as RegularUnit;
        const halfCount = Math.ceil(regularUnit.count / 2);
        if (halfCount === regularUnit.count) {
          unitsToMove.push(unit);
        } else {
          unitsToMove.push({ ...regularUnit, count: halfCount });
          remainingUnits.push({ ...regularUnit, count: regularUnit.count - halfCount });
        }
      }
    });

    updateFromUnits([...fromUnits, ...unitsToMove]);
    updateToUnits(remainingUnits);
  };

  const moveOneUnit = (
    fromArray: Unit[],
    toArray: Unit[],
    unitIndex: number,
    direction: 'right' | 'left'
  ) => {
    const unit = fromArray[unitIndex];
    if (!unit) return;

    if (isHero(unit)) {
      // Move entire hero
      const newFromArray = fromArray.filter((_, index) => index !== unitIndex);
      const newToArray = [...toArray, unit];

      if (direction === 'right') {
        updateFromUnits(newFromArray);
        updateToUnits(newToArray);
      } else {
        updateToUnits(newFromArray);
        updateFromUnits(newToArray);
      }
    } else {
      const regularUnit = unit as RegularUnit;
      if (regularUnit.count === 1) {
        // Move the last unit
        const newFromArray = fromArray.filter((_, index) => index !== unitIndex);
        const newToArray = [...toArray, unit];

        if (direction === 'right') {
          updateFromUnits(newFromArray);
          updateToUnits(newToArray);
        } else {
          updateToUnits(newFromArray);
          updateFromUnits(newToArray);
        }
      } else {
        // Move one unit, reduce count
        const newFromArray = fromArray.map((u, index) =>
          index === unitIndex ? { ...regularUnit, count: regularUnit.count - 1 } : u
        );
        const existingUnitIndex = toArray.findIndex(
          (u) =>
            !isHero(u) &&
            (u as RegularUnit).id === regularUnit.id &&
            (u as RegularUnit).level === regularUnit.level
        );

        let newToArray: Unit[];
        if (existingUnitIndex >= 0) {
          // Add to existing unit stack
          newToArray = toArray.map((u, index) =>
            index === existingUnitIndex
              ? { ...(u as RegularUnit), count: (u as RegularUnit).count + 1 }
              : u
          );
        } else {
          // Create new unit with count 1
          newToArray = [...toArray, { ...regularUnit, count: 1 }];
        }

        if (direction === 'right') {
          updateFromUnits(newFromArray);
          updateToUnits(newToArray);
        } else {
          updateToUnits(newFromArray);
          updateFromUnits(newToArray);
        }
      }
    }
  };

  const handleMouseDown = (fromArray: Unit[], unitIndex: number, direction: 'right' | 'left') => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Snapshot the selected unit identity to handle dynamic arrays
    const selectedUnit = fromArray[unitIndex];
    // Move one unit immediately using current refs
    const currentFrom = direction === 'right' ? fromUnitsRef.current : toUnitsRef.current;
    const currentTo = direction === 'right' ? toUnitsRef.current : fromUnitsRef.current;

    const findCurrentIndex = (): number => {
      const arr = direction === 'right' ? fromUnitsRef.current : toUnitsRef.current;
      if (!selectedUnit) return -1;
      if (isHero(selectedUnit)) {
        const hero = selectedUnit as HeroUnit;
        return arr.findIndex(
          (u) => isHero(u) && (u as HeroUnit).name === hero.name && (u as HeroUnit).id === hero.id
        );
      } else {
        const reg = selectedUnit as RegularUnit;
        return arr.findIndex(
          (u) =>
            !isHero(u) && (u as RegularUnit).id === reg.id && (u as RegularUnit).level === reg.level
        );
      }
    };

    const initialIndex = findCurrentIndex();
    if (initialIndex >= 0) {
      moveOneUnit(currentFrom, currentTo, initialIndex, direction);
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
      moveOneUnit(liveFrom, liveTo, idx, direction);
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
  const renderUnit = (
    unit: Unit,
    index: number,
    fromArray: Unit[],
    direction: 'right' | 'left'
  ) => {
    const colorClass = getUnitColorClass(unit);
    const isHeroUnit = isHero(unit);
    const regularUnit = unit as RegularUnit;
    const heroUnit = unit as HeroUnit;

    return (
      <div
        data-testid={`${isHeroUnit ? heroUnit.name : regularUnit.id}-${index}`}
        key={`${isHeroUnit ? heroUnit.name : regularUnit.id}-${index}`}
        className={`${styles.unitItem} ${colorClass}`}
        onMouseDown={() => handleMouseDown(fromArray, index, direction)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {isHeroUnit ? (
          <div>
            <div className={styles.unitName}>{heroUnit.name}</div>
            <div className={styles.unitDetails}>
              {heroUnit.id} - Level {heroUnit.level}
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.unitName}>{regularUnit.id}</div>
            <div className={styles.unitDetails}>
              Count: {regularUnit.count} ({regularUnit.level})
            </div>
          </div>
        )}
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
                {fromUnits.length === 0 ? (
                  <div className={styles.emptyMessage}>No units available</div>
                ) : (
                  fromUnits.map((unit, index) => renderUnit(unit, index, fromUnits, 'right'))
                )}
              </div>
            </div>

            {/* Transfer buttons */}
            <div className={styles.transferButtons}>
              <button
                className={styles.transferButton}
                onClick={moveAllToRight}
                disabled={fromUnits.length === 0}
              >
                Move All →
              </button>

              <button
                className={styles.transferButton}
                onClick={moveHalfToRight}
                disabled={fromUnits.length === 0}
              >
                Move Half →
              </button>

              <button
                className={styles.transferButton}
                onClick={moveHalfToLeft}
                disabled={toUnits.length === 0}
              >
                ← Move Half
              </button>

              <button
                className={styles.transferButton}
                onClick={moveAllToLeft}
                disabled={toUnits.length === 0}
              >
                ← Move All
              </button>
            </div>

            {/* To panel */}
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Units to Move</div>
              <div className={styles.panelContent}>
                {toUnits.length === 0 ? (
                  <div className={styles.emptyMessage}>No units selected</div>
                ) : (
                  toUnits.map((unit, index) => renderUnit(unit, index, toUnits, 'left'))
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
