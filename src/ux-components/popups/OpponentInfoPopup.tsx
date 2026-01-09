import React from 'react';
import commonStyles from './css/Popup.module.css';
import styles from './css/OpponentInfoPopup.module.css';

import Avatar from '../avatars/Avatar';
import PopupWrapper from './PopupWrapper';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getAlignmentColor } from '../../domain/ui/alignmentColors';
import { getPlayerColorValue } from '../../domain/ui/playerColors';
import { DiplomacyStatus } from '../../types/Diplomacy';

import type { PopupProps } from './PopupWrapper';
import type { PlayerState } from '../../state/player/PlayerState';

export interface OpponentInfoProps extends PopupProps {
  opponent?: PlayerState;
}

const OpponentInfoPopup: React.FC<OpponentInfoProps> = ({ opponent, screenPosition }) => {
  const { hideOpponentInfo, clearAllGlow, showDiplomacyContact } = useApplicationContext();
  const { gameState } = useGameContext();

  if (opponent == null || gameState == null) return null;

  const selectedPlayer = getTurnOwner(gameState);
  const diplomacyStatus =
    selectedPlayer?.diplomacy[opponent.id]?.status ?? DiplomacyStatus.NO_TREATY;

  const handleClose = () => {
    hideOpponentInfo();
    clearAllGlow(); // Clear glow effect when closing popup
  };

  const handleContactClick = () => {
    // Open diplomacy contact dialog and close the popup
    showDiplomacyContact(opponent);
    hideOpponentInfo();
    clearAllGlow();
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
          <h3 className={`${commonStyles.title} ${styles.title}`}>{opponent.playerProfile.name}</h3>
        </div>

        <div className={commonStyles.characteristics}>
          <div className={styles.avatarSection}>
            <Avatar
              player={opponent.playerProfile}
              size={55}
              shape="rectangle"
              borderColor={getPlayerColorValue(opponent.color)}
              className={styles.opponentAvatar}
            />
            <button
              className={styles.contactButton}
              onClick={handleContactClick}
              title="Open Diplomatic Contact"
            >
              Contact
            </button>
          </div>

          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Race:</span>
            <span className={`${commonStyles.value} ${styles.value}`}>
              {opponent.playerProfile.race}
            </span>
          </div>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Alignment:</span>
            <span
              className={`${commonStyles.value} ${styles.value}`}
              style={{ color: getAlignmentColor(opponent.playerProfile.alignment) }}
            >
              {opponent.playerProfile.alignment}
            </span>
          </div>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Level:</span>
            <span className={`${commonStyles.value} ${styles.value}`}>
              {opponent.playerProfile.level}
            </span>
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
