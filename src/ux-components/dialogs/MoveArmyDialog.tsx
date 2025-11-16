import React, { useState, useRef } from 'react';
import styles from './css/MoveArmyDialog.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';

import { ButtonName } from '../../types/ButtonName';
import { Unit, RegularUnit, HeroUnit, UnitRank, isHero } from '../../types/Army';
import { getLand } from '../../map/utils/getLands';
import { startMovement } from '../../map/move-army/startMovement';

const MoveArmyDialog: React.FC = () => {
  const { setMoveArmyPath, moveArmyPath } = useApplicationContext();
  const { gameState } = useGameContext();

  // Initialize state with empty arrays - will be set correctly in useEffect
  const [fromUnits, setFromUnits] = useState<Unit[]>([]);
  const [toUnits, setToUnits] = useState<Unit[]>([]);

  // Refs for click-and-hold functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize units when moveArmyPath or gameState changes
  React.useEffect(() => {
    if (!moveArmyPath || !gameState) {
      setFromUnits([]);
      setToUnits([]);
      return;
    }

    const stationedArmy = getLand(gameState, moveArmyPath.from).army.filter(
      (a) => a.movements == null
    );

    if (stationedArmy == null || stationedArmy.length === 0) {
      setFromUnits([]);
      setToUnits([]);
      return;
    }

    const initialUnits = stationedArmy[0].units;
    setFromUnits(initialUnits);
    setToUnits([]);
  }, [moveArmyPath, gameState]);

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

    const from = moveArmyPath.from;
    const to = moveArmyPath.to;

    setMoveArmyPath(undefined);
    startMovement(from, to, toUnits, gameState);
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
    setToUnits([...toUnits, ...fromUnits]);
    setFromUnits([]);
  };

  const moveAllToLeft = () => {
    setFromUnits([...fromUnits, ...toUnits]);
    setToUnits([]);
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

    setToUnits([...toUnits, ...unitsToMove]);
    setFromUnits(remainingUnits);
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

    setFromUnits([...fromUnits, ...unitsToMove]);
    setToUnits(remainingUnits);
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
        setFromUnits(newFromArray);
        setToUnits(newToArray);
      } else {
        setToUnits(newFromArray);
        setFromUnits(newToArray);
      }
    } else {
      const regularUnit = unit as RegularUnit;
      if (regularUnit.count === 1) {
        // Move the last unit
        const newFromArray = fromArray.filter((_, index) => index !== unitIndex);
        const newToArray = [...toArray, unit];

        if (direction === 'right') {
          setFromUnits(newFromArray);
          setToUnits(newToArray);
        } else {
          setToUnits(newFromArray);
          setFromUnits(newToArray);
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
          setFromUnits(newFromArray);
          setToUnits(newToArray);
        } else {
          setToUnits(newFromArray);
          setFromUnits(newToArray);
        }
      }
    }
  };

  const handleMouseDown = (
    fromArray: Unit[],
    toArray: Unit[],
    unitIndex: number,
    direction: 'right' | 'left'
  ) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Move one unit immediately
    moveOneUnit(fromArray, toArray, unitIndex, direction);

    // Start interval for continuous movement
    intervalRef.current = setInterval(() => {
      moveOneUnit(fromArray, toArray, unitIndex, direction);
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
    toArray: Unit[],
    direction: 'right' | 'left'
  ) => {
    const colorClass = getUnitColorClass(unit);
    const isHeroUnit = isHero(unit);
    const regularUnit = unit as RegularUnit;
    const heroUnit = unit as HeroUnit;

    return (
      <div
        key={`${isHeroUnit ? heroUnit.name : regularUnit.id}-${index}`}
        className={`${styles.unitItem} ${colorClass}`}
        onMouseDown={() => handleMouseDown(fromArray, toArray, index, direction)}
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
    <div data-testid="MoveArmyDialog">
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
                  fromUnits.map((unit, index) =>
                    renderUnit(unit, index, fromUnits, toUnits, 'right')
                  )
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
                  toUnits.map((unit, index) => renderUnit(unit, index, toUnits, fromUnits, 'left'))
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
