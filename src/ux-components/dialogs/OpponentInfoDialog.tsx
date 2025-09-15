import React from 'react';
import { GamePlayer } from '../../types/GamePlayer';
import { getAlignmentColor } from '../../types/Alignment';
import PlayerAvatar from '../avatars/PlayerAvatar';
import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import OkButton from '../buttons/OkButton';
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

  const DIALOG_WIDTH = 400;
  const DIALOG_HEIGHT = 400;
  const DIALOG_X = (window.innerWidth - DIALOG_WIDTH) / 2;
  const DIALOG_Y = (window.innerHeight - DIALOG_HEIGHT) / 2;

  return (
    <FantasyBorderFrame
      x={DIALOG_X}
      y={DIALOG_Y}
      width={DIALOG_WIDTH}
      height={DIALOG_HEIGHT}
      secondaryButton={<OkButton onClick={onClose} />}
    >
      <div className={styles.opponentInfo}>
        <div className={styles.opponentHeader}>
          <PlayerAvatar
            player={opponent}
            size={55}
            shape="rectangle"
            borderColor={opponent.color}
            className={styles.opponentAvatar}
          />
          <h3 className={styles.opponentName}>{opponent.name}</h3>
        </div>
        <div className={styles.opponentDetails}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Race:</span>
            <span className={styles.value}>{opponent.race}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Alignment:</span>
            <span className={styles.value} style={{ color: getAlignmentColor(opponent.alignment) }}>
              {opponent.alignment}
            </span>
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
    </FantasyBorderFrame>
  );
};

export default OpponentInfoDialog;
