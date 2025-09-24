import React, { useEffect, useRef } from 'react';
import { GamePlayer } from '../../types/GamePlayer';
import { getAlignmentColor } from '../../types/Alignment';
import PlayerAvatar from '../avatars/PlayerAvatar';
import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import styles from './css/OpponentInfoDialog.module.css';

export type DiplomacyStatus = 'No Treaty' | 'Peace' | 'War';

export interface OpponentWithDiplomacy extends GamePlayer {
  diplomacyStatus: DiplomacyStatus;
}

interface OpponentInfoDialogProps {
  opponent: OpponentWithDiplomacy | null;
  screenPosition: { x: number; y: number };
  onClose: () => void;
}

const OpponentInfoDialog: React.FC<OpponentInfoDialogProps> = ({
  opponent,
  screenPosition,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!opponent) return null;

  // Calculate dynamic size based on content (larger than LandCharacteristicsPopup)
  const headerHeight = 60; // Header with avatar and name
  const baseContentPadding = 16; // Top and bottom padding
  const standardRowHeight = 47; // Height per data row

  // Standard rows: Race, Alignment, Level, Diplomatic Relations
  let totalContentHeight = 4 * standardRowHeight;

  const calculatedHeight = headerHeight + baseContentPadding + totalContentHeight;
  const dynamicHeight = Math.min(calculatedHeight, 400); // Increased max height from 320 to 400
  const dynamicWidth = 310; // Increased width from 300 to 350

  return (
    <div ref={popupRef}>
      <FantasyBorderFrame
        x={screenPosition.x - 50}
        y={screenPosition.y + 10}
        width={dynamicWidth}
        height={dynamicHeight}
        tileSize={{ width: 20, height: 70 }}
        accessible={true}
        flexibleSizing={true}
      >
        <div className={styles.popupContent}>
          <div className={styles.header}>
            <h3 className={styles.title}>{opponent.name}</h3>
          </div>

          <div className={styles.characteristics}>
            <div className={styles.avatarSection}>
              <PlayerAvatar
                player={opponent}
                size={55}
                shape="rectangle"
                borderColor={opponent.color}
                className={styles.opponentAvatar}
              />
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Race:</span>
              <span className={styles.value}>{opponent.race}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Alignment:</span>
              <span
                className={styles.value}
                style={{ color: getAlignmentColor(opponent.alignment) }}
              >
                {opponent.alignment}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Level:</span>
              <span className={styles.value}>{opponent.level}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Diplomatic Relations:</span>
              <span
                className={`${styles.value} ${styles.diplomacyStatus} ${styles[opponent.diplomacyStatus.toLowerCase().replace(' ', '')]}`}
              >
                {opponent.diplomacyStatus}
              </span>
            </div>
          </div>
        </div>
      </FantasyBorderFrame>
    </div>
  );
};

export default OpponentInfoDialog;
