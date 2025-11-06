import React from 'react';
import './css/FlipBook.css';
import styles from './css/FlipBookPage.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { GameState } from '../../types/GameState';

import { toRoman } from '../../map/utils/romanNumerals';

import { getSpellById, SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';
import { getAvailableToConstructLands } from '../../map/building/getAvailableToConstructLands';
import { getAvailableToCastSpellLands } from '../../map/cast-spell/getAvailableToCastSpellLands';
import { startRecruiting } from '../../map/recruiting/startRecruiting';
import { getDefaultUnit, HeroUnit, HeroUnitType, UnitType } from '../../types/Army';
import { LandPosition } from '../../map/utils/getLands';
import { startQuest } from '../../map/quest/startQuest';
import { getQuestType } from '../../map/quest/Quest';

export interface Slot {
  id: string;
  name: string;
}

export enum FlipBookPageType {
  SPELL = 'Spell',
  BUILDING = 'Building',
  RECRUIT = 'Recruit',
  QUEST = 'Quest',
}

interface FlipBookPageProps {
  dialogType: FlipBookPageType;
  pageNum: number;
  header?: string;
  iconPath?: string;
  description?: string;
  cost?: number;
  costLabel?: string;
  maintainCost?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
  slots?: Slot[];
  landId?: LandPosition;
}

const getAvailableLands = (
  gameState: GameState,
  actionType: FlipBookPageType,
  name: SpellName | BuildingType
): string[] => {
  if (gameState == null) return [];

  if (actionType === FlipBookPageType.BUILDING) {
    return getAvailableToConstructLands(gameState, name as BuildingType);
  } else {
    return getAvailableToCastSpellLands(gameState, name as SpellName);
  }
};

const FlipBookPage = React.forwardRef<HTMLDivElement, FlipBookPageProps>(
  (
    {
      dialogType,
      pageNum,
      header,
      iconPath,
      description,
      cost,
      costLabel = 'Cost',
      maintainCost,
      children,
      className,
      style,
      onClose,
      slots,
      landId,
    },
    ref
  ) => {
    const { setSelectedLandAction, addGlowingTile } = useApplicationContext();
    const { gameState } = useGameContext();

    const isEvenPage = pageNum % 2 === 1;
    const defaultClassName = isEvenPage ? 'evenPage' : 'oddPage';
    const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

    const romanPageNum = (): string => {
      switch (dialogType) {
        case FlipBookPageType.SPELL:
          return toRoman(1027 + pageNum);
        case FlipBookPageType.BUILDING:
          return toRoman(2351 + pageNum);
        case FlipBookPageType.RECRUIT:
          return toRoman(3685 + pageNum);
        case FlipBookPageType.QUEST:
          return toRoman(5019 + pageNum);
        default:
          return toRoman(pageNum);
      }
    };

    const handleIconClick = () => {
      if (header) {
        switch (dialogType) {
          case FlipBookPageType.SPELL:
          case FlipBookPageType.BUILDING:
            setSelectedLandAction(`${dialogType}: ` + header);
            const name =
              dialogType === FlipBookPageType.SPELL
                ? getSpellById(header as SpellName).id
                : (header as BuildingType);

            // Add tiles to the glowing tiles set for visual highlighting
            getAvailableLands(gameState!, dialogType, name).forEach((tileId) => {
              addGlowingTile(tileId);
            });
            break;
          case FlipBookPageType.RECRUIT:
            startRecruiting(header as UnitType, landId!, gameState!);
            break;
          case FlipBookPageType.QUEST:
            startQuest(
              getDefaultUnit(HeroUnitType.DRUID) as HeroUnit, // todo select hero from slot or all heroes
              getQuestType(pageNum + 1),
              gameState!
            );
            break;
        }

        if (onClose) {
          onClose();
        }
      }
    };

    const handleSlotClick = (slot: Slot) => {
      switch (dialogType) {
        case FlipBookPageType.RECRUIT:
          startRecruiting(header as UnitType, landId!, gameState!);
          break;
        case FlipBookPageType.QUEST:
          startQuest(
            getDefaultUnit(HeroUnitType.DRUID) as HeroUnit, // todo select hero from slot or all heroes
            getQuestType(pageNum + 1),
            gameState!
          );
          break;
        default:
          // should not be reached since other dialogs don't have slots
          break;
      }
      alert(`Selected slot: ${slot.name}${landId ? `, Land ID: ${landId}` : ''}`);
    };

    return (
      <div className={`pageStyle ${finalClassName}`} ref={ref} style={style}>
        {children || (
          <>
            <div className={styles.caption}>{header}</div>
            <div className={styles.imageSlotContainer}>
              <img
                src={iconPath}
                alt={header}
                className={`icon clickable-icon ${styles.icon}`}
                onClick={handleIconClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter =
                    'brightness(1.2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onError={(e) => {
                  // Fallback to a placeholder or hide an image on error
                  e.currentTarget.style.display = 'none';
                }}
              />
              {slots && slots.length > 0 && (
                <div
                  className={`${styles.slotsContainer} ${slots.length > 3 ? styles.slotsScrollable : styles.slotsVisible}`}
                >
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      className={styles.slot}
                    ></div>
                  ))}
                </div>
              )}
            </div>
            <div className="description">
              <h4 className={styles.descriptionTitle}>Description:</h4>
              <p className={styles.descriptionText}>{description}</p>
              <br />
              <div className="costSection">
                <h4 className={styles.costTitle}>
                  {costLabel}: <span className="costValue">{cost}</span>
                </h4>
              </div>
              {maintainCost != null && maintainCost >= 0 && (
                <div className="costSection">
                  <h4 className={styles.costTitle}>
                    Maintain Cost: <span className="costValue">{maintainCost}</span>
                  </h4>
                </div>
              )}
            </div>
            <h4 className={styles.pageNumber}>- {romanPageNum()} -</h4>
          </>
        )}
      </div>
    );
  }
);

export default FlipBookPage;
