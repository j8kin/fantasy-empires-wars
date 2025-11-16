import React from 'react';
import commonStyles from './css/Popup.module.css';
import styles from './css/OpponentInfoPopup.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import Avatar from '../avatars/Avatar';
import PopupWrapper, { PopupProps } from './PopupWrapper';

import { getAlignmentColor } from '../../types/Alignment';
import { PlayerInfo } from '../../types/GamePlayer';
import { getTurnOwner } from '../../types/GameState';
import { DiplomacyStatus } from '../../types/Diplomacy';

export interface OpponentInfoProps extends PopupProps {
  opponent?: PlayerInfo;
}

const OpponentInfoPopup: React.FC<OpponentInfoProps> = ({ opponent, screenPosition }) => {
  const { hideOpponentInfo, clearAllGlow } = useApplicationContext();
  const { gameState } = useGameContext();

  if (opponent == null || gameState == null) return null;

  const selectedPlayer = getTurnOwner(gameState);
  const diplomacyStatus = selectedPlayer?.diplomacy![opponent.id] || DiplomacyStatus.NO_TREATY;

  const handleClose = () => {
    hideOpponentInfo();
    clearAllGlow(); // Clear glow effect when closing popup
  };

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
    <PopupWrapper
      screenPosition={{ x: screenPosition.x - 50, y: screenPosition.y + 10 }}
      dimensions={{ width: dynamicWidth, height: dynamicHeight }}
      onClose={handleClose}
    >
      <div className={commonStyles.popupContent}>
        <div className={`${commonStyles.header} ${styles.header}`}>
          <h3 className={`${commonStyles.title} ${styles.title}`}>{opponent.name}</h3>
        </div>

        <div className={commonStyles.characteristics}>
          <div className={styles.avatarSection}>
            <Avatar
              player={opponent}
              size={55}
              shape="rectangle"
              borderColor={opponent.color}
              className={styles.opponentAvatar}
            />
          </div>

          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Race:</span>
            <span className={`${commonStyles.value} ${styles.value}`}>{opponent.race}</span>
          </div>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Alignment:</span>
            <span
              className={`${commonStyles.value} ${styles.value}`}
              style={{ color: getAlignmentColor(opponent.alignment) }}
            >
              {opponent.alignment}
            </span>
          </div>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Level:</span>
            <span className={`${commonStyles.value} ${styles.value}`}>{opponent.level}</span>
          </div>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Diplomatic Relations:</span>
            <span
              className={`${commonStyles.value} ${styles.value} ${styles.diplomacyStatus} ${styles[diplomacyStatus.toLowerCase().replace(' ', '')]}`}
            >
              {diplomacyStatus}
            </span>
          </div>
        </div>
      </div>
    </PopupWrapper>
  );
};

export default OpponentInfoPopup;
