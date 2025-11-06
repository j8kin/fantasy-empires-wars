import React, { useState, useCallback, useEffect } from 'react';
import styles from './css/FlipBookPage.module.css';

import { toRoman } from '../../map/utils/romanNumerals';

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
  onSlotClick?: (slot: Slot) => void;
  onIconClick?: () => void;
}

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
      onSlotClick,
      onIconClick,
    },
    ref
  ) => {
    // State to track used slots
    const [usedSlots, setUsedSlots] = useState<Set<string>>(new Set());

    // Filter out used slots from the available slots
    const availableSlots = slots?.filter((slot) => !usedSlots.has(slot.id)) || [];

    // Effect to check if all slots are used and trigger callback
    useEffect(() => {
      if (slots && slots.length > 0 && availableSlots.length === 0 && onClose) {
        onClose();
      }
    }, [slots, availableSlots.length, onClose]);

    // Enhanced slot click handler that marks slot as used
    const handleSlotClick = useCallback(
      (slot: Slot) => {
        if (onSlotClick) {
          onSlotClick(slot);
          // Mark this slot as used
          setUsedSlots((prev) => new Set(prev).add(slot.id));
        }
      },
      [onSlotClick]
    );
    const isEvenPage = pageNum % 2 === 1;
    const defaultClassName = isEvenPage ? styles.evenPage : styles.oddPage;
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
      if (onIconClick) {
        onIconClick();
      }
    };

    return (
      <div className={`${styles.pageStyle} ${finalClassName}`} ref={ref} style={style}>
        {children || (
          <>
            <div className={styles.caption}>{header}</div>
            <div className={styles.imageSlotContainer}>
              <img
                src={iconPath}
                alt={header}
                className={`${styles.icon} clickable-icon`}
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
              {onSlotClick && availableSlots && availableSlots.length > 0 && (
                <div
                  className={`${styles.slotsContainer} ${availableSlots.length > 3 ? styles.slotsScrollable : styles.slotsVisible}`}
                >
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      className={styles.slot}
                    ></div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.description}>
              <h4 className={styles.descriptionTitle}>Description:</h4>
              <p
                className={
                  maintainCost == null ? styles.descriptionTextExpanded : styles.descriptionText
                }
              >
                {description}
              </p>
              <br />
              {costLabel && cost != null && cost >= 0 && (
                <div className={styles.costSection}>
                  <h4 className={styles.costTitle}>
                    {costLabel}: <span className={styles.costValue}>{cost}</span>
                  </h4>
                </div>
              )}
              {maintainCost != null && maintainCost >= 0 && (
                <div className={styles.costSection}>
                  <h4 className={styles.costTitle}>
                    Maintain Cost: <span className={styles.costValue}>{maintainCost}</span>
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
