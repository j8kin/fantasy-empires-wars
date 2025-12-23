import React, { useCallback, useEffect } from 'react';
import styles from './css/FlipBookPage.module.css';

import { toRoman } from '../../utils/romanNumerals';

export interface Slot {
  id: string;
  name: string;
}

export const FlipBookPageTypeName = {
  SPELL: 'Spell',
  BUILDING: 'Building',
  RECRUIT: 'Recruit',
  QUEST: 'Quest',
} as const;

export type FlipBookPageType = (typeof FlipBookPageTypeName)[keyof typeof FlipBookPageTypeName];

export interface FlipBookPageProps {
  pageNum: number;
  lorePage: number;
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
  usedSlots?: Set<string>;
}

const FlipBookPage = React.forwardRef<HTMLDivElement, FlipBookPageProps>(
  (
    {
      pageNum,
      lorePage,
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
      usedSlots,
    },
    ref
  ) => {
    // Use provided usedSlots or default to empty set
    const effectiveUsedSlots = usedSlots || new Set<string>();

    // Filter out used slots from the available slots
    const availableSlots = slots?.filter((slot) => !effectiveUsedSlots.has(slot.id)) || [];

    // Effect to check if all slots are used and trigger callback
    useEffect(() => {
      if (slots && slots.length > 0 && effectiveUsedSlots.size === slots.length && onClose) {
        onClose();
      }
    }, [slots, effectiveUsedSlots.size, onClose]);

    // Slot click handler - slot marking as used is now handled by parent
    const handleSlotClick = useCallback(
      (e: React.MouseEvent, slot: Slot) => {
        e.stopPropagation();
        if (onSlotClick) {
          onSlotClick(slot);
        }
      },
      [onSlotClick]
    );
    const isEvenPage = pageNum % 2 === 1;
    const defaultClassName = isEvenPage ? styles.evenPage : styles.oddPage;
    const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

    const handleIconClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onIconClick) {
        onIconClick();
      }
    };

    return (
      <div
        data-testid={'flipbook-page-' + header}
        className={`${styles.pageStyle} ${finalClassName}`}
        ref={ref}
        style={style}
      >
        {children || (
          <>
            <div className={styles.caption}>{header}</div>
            <div className={styles.imageSlotContainer}>
              <img
                data-testid={'flipbook-icon'}
                src={iconPath}
                alt={header}
                className={`${styles.icon} clickable-icon`}
                onClick={handleIconClick}
                onMouseEnter={
                  onIconClick
                    ? (e) => {
                        e.currentTarget.style.filter =
                          'brightness(1.2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    : undefined
                }
                onMouseLeave={
                  onIconClick
                    ? (e) => {
                        e.currentTarget.style.filter = 'brightness(1)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    : undefined
                }
                onError={(e) => {
                  // Fallback to a placeholder or hide an image on error
                  e.currentTarget.style.display = 'none';
                }}
              />
              {onSlotClick && availableSlots && availableSlots.length > 0 && (
                <div
                  data-testid="flipbook-slots"
                  className={`${styles.slotsContainer} ${availableSlots.length > 3 ? styles.slotsScrollable : styles.slotsVisible}`}
                >
                  {availableSlots.map((slot) => (
                    <div
                      data-testid={'flipbook-slot-' + slot.id}
                      key={slot.id}
                      onClick={(e) => handleSlotClick(e, slot)}
                      className={styles.slot}
                    >
                      <span className={styles.descriptionText}>{slot.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.description}>
              <h4 className={styles.descriptionTitle}>Description:</h4>
              <p
                data-testid="flipbook-description-text"
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
            <h4 className={styles.pageNumber} data-testid={'flipbook-page-number-' + pageNum}>
              - {toRoman(lorePage + pageNum)} -
            </h4>
          </>
        )}
      </div>
    );
  }
);

export default FlipBookPage;
