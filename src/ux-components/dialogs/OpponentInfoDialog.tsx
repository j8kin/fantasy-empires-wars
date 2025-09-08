import React from 'react';
import { GamePlayer } from '../../types/GamePlayer';
import styles from './css/OpponentInfoDialog.module.css';

export type DiplomacyStatus = 'No Treaty' | 'Peace' | 'War';

export interface OpponentWithDiplomacy extends GamePlayer {
  diplomacyStatus: DiplomacyStatus;
}

interface OpponentInfoDialogProps {
  opponent: OpponentWithDiplomacy | null;
  onClose: () => void;
}

const OpponentInfoDialog: React.FC<OpponentInfoDialogProps> = ({ opponent, onClose }) => {
  if (!opponent) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.dialog}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <div className={styles.opponentInfo}>
          <h3 className={styles.opponentName}>{opponent.name}</h3>
          <div className={styles.opponentDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Race:</span>
              <span className={styles.value}>{opponent.race}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Alignment:</span>
              <span className={styles.value}>{opponent.alignment}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Level:</span>
              <span className={styles.value}>{opponent.level}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Diplomatic Relations:</span>
              <span
                className={`${styles.value} ${styles.diplomacyStatus} ${styles[opponent.diplomacyStatus.toLowerCase().replace(' ', '')]}`}
              >
                {opponent.diplomacyStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpponentInfoDialog;
