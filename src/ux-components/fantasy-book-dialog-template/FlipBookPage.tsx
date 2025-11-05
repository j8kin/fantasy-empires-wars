import React from 'react';
import './css/FlipBook.css';
import styles from './css/FlipBookPage.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { GameState } from '../../types/GameState';

import { getSpellById, SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';
import { toRoman } from '../../map/utils/romanNumerals';
import { getAvailableToConstructLands } from '../../map/building/getAvailableToConstructLands';
import { getAvailableToCastSpellLands } from '../../map/cast-spell/getAvailableToCastSpellLands';

interface Slot {
  id: string;
  name: string;
  iconPath?: string;
  landId?: string;
}

interface FlipBookPageProps {
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
}

const getAvailableLands = (
  gameState: GameState,
  actionType: 'spell' | 'building',
  name: SpellName | BuildingType
): string[] => {
  if (gameState == null) return [];

  if (actionType === 'building') {
    return getAvailableToConstructLands(gameState, name as BuildingType);
  } else {
    return getAvailableToCastSpellLands(gameState, name as SpellName);
  }
};

const FlipBookPage = React.forwardRef<HTMLDivElement, FlipBookPageProps>(
  (
    {
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
    },
    ref
  ) => {
    const { setSelectedLandAction, addGlowingTile } = useApplicationContext();
    const { gameState } = useGameContext();

    const isEvenPage = pageNum % 2 === 1;
    const defaultClassName = isEvenPage ? 'evenPage' : 'oddPage';
    const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;
    const isSpellBook = costLabel === 'Mana Cost';

    const romanPageNum = toRoman(isSpellBook ? 1027 : 2351 + pageNum);

    const handleIconClick = () => {
      if (header) {
        setSelectedLandAction((isSpellBook ? 'Spell: ' : 'Building: ') + header);
        const actionType = isSpellBook ? 'spell' : 'building';
        const name = isSpellBook ? getSpellById(header as SpellName).id : (header as BuildingType);

        if (onClose) {
          onClose(); // close dialog to apply spell or construction
        }

        // Add tiles to the glowing tiles set for visual highlighting
        getAvailableLands(gameState!, actionType, name).forEach((tileId) => {
          addGlowingTile(tileId);
        });
      }
    };

    const handleSlotClick = (slot: Slot) => {
      alert(`Selected slot: ${slot.name}${slot.landId ? `, Land ID: ${slot.landId}` : ''}`);
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
                    >
                      {slot.iconPath ? (
                        <img src={slot.iconPath} alt={slot.name} className={styles.slotIcon} />
                      ) : (
                        <span className={styles.slotText}>{slot.name.slice(0, 3)}</span>
                      )}
                    </div>
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
              {!isSpellBook && maintainCost! >= 0 && (
                <div className="costSection">
                  <h4 className={styles.costTitle}>
                    Maintain Cost: <span className="costValue">{maintainCost}</span>
                  </h4>
                </div>
              )}
            </div>
            <h4 className={styles.pageNumber}>- {romanPageNum} -</h4>
          </>
        )}
      </div>
    );
  }
);

export default FlipBookPage;
