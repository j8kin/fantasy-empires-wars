import React from 'react';
import commonStyles from './css/Popup.module.css';
import styles from './css/LandCharacteristicsPopup.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import { LandPosition, getLandId } from '../../state/LandState';
import { NO_PLAYER } from '../../state/PlayerState';

import { getAlignmentColor } from '../../types/Alignment';

import PopupWrapper, { PopupProps } from './PopupWrapper';

interface LandCharacteristicsPopupProps extends PopupProps {
  battlefieldPosition: LandPosition;
}

const LandCharacteristicsPopup: React.FC<LandCharacteristicsPopupProps> = ({
  battlefieldPosition,
  screenPosition,
}) => {
  const { hideLandPopup } = useApplicationContext();
  const { gameState } = useGameContext();
  const land = gameState!.map.lands[getLandId(battlefieldPosition)];

  // Calculate dynamic size based on content type
  //  Base heights and row spacing
  const headerHeight = 34; // Header with title (6px padding * 2 + 20px content)
  const standardRowHeight = 21; // Height per standard data row (Alignment, ControlledBy etc) (12px font + 6px margin)
  const buildingRowHeight = 24; // Height for building rows (includes building chip padding + gaps)
  const armyRowHeight = 21; // Height for army row (standard)

  // Calculate height for each content type separately
  // Standard rows: Alignment, Position, Gold per Turn, Controlled By
  let calculatedHeight = headerHeight + 4 * standardRowHeight + 15;

  // Buildings row - accounts for building chips and their styling
  if (land.buildings && land.buildings.length > 0) {
    calculatedHeight += land.buildings.length * buildingRowHeight;
  }

  // Army rows - separate heroes and units
  const heroes = land.army.flatMap((a) => a.heroes);
  const units = land.army.flatMap((a) => a.regulars);

  if (heroes.length > 0) {
    calculatedHeight += heroes.length * armyRowHeight;
  }

  if (units.length > 0) {
    calculatedHeight += units.length * armyRowHeight;
  }

  //  Final height calculation
  const dynamicHeight = Math.min(calculatedHeight, 270); // Max height limit
  const dynamicWidth = 320;

  // Calculate adjusted screen position to keep popup within window bounds
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const popupWidth = dynamicWidth;
  const popupHeight = dynamicHeight + 30; // Adding the 30 from dimensions prop

  let adjustedX = screenPosition.x + 10;
  let adjustedY = screenPosition.y + 10;

  // Check if popup would overflow on the right edge
  if (adjustedX + popupWidth > windowWidth) {
    adjustedX = screenPosition.x - popupWidth - 10; // Position to the left of cursor
    // If still overflows, position at window edge
    if (adjustedX < 0) {
      adjustedX = windowWidth - popupWidth - 10;
    }
  }

  // Check if popup would overflow on the bottom edge
  if (adjustedY + popupHeight > windowHeight) {
    adjustedY = screenPosition.y - popupHeight - 10; // Position above cursor
    // If still overflows, position at window edge
    if (adjustedY < 0) {
      adjustedY = windowHeight - popupHeight - 10;
    }
  }

  // Ensure popup doesn't go beyond left or top edges
  adjustedX = Math.max(10, adjustedX);
  adjustedY = Math.max(10, adjustedY);

  return (
    <PopupWrapper
      screenPosition={{ x: adjustedX, y: adjustedY }}
      dimensions={{ width: dynamicWidth, height: dynamicHeight + 30 }}
      onClose={hideLandPopup}
    >
      <div className={commonStyles.popupContent}>
        <div className={`${commonStyles.header} ${styles.header}`}>
          <h3 className={`${commonStyles.title} ${styles.title}`}>{land.land.id}</h3>
        </div>

        <div className={commonStyles.characteristics}>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Alignment:</span>
            <span
              className={commonStyles.value}
              style={{ color: getAlignmentColor(land.land.alignment) }}
            >
              {land.land.alignment}
            </span>
          </div>

          {land && (
            <>
              <div className={`${commonStyles.row} ${styles.row}`}>
                <span className={`${commonStyles.label} ${styles.label}`}>Position:</span>
                <span className={commonStyles.value}>
                  {battlefieldPosition.row}, {battlefieldPosition.col}
                </span>
              </div>
              <div className={`${commonStyles.row} ${styles.row}`}>
                <span className={`${commonStyles.label} ${styles.label}`}>Gold per Turn:</span>
                <span className={commonStyles.value}>{land.goldPerTurn}</span>
              </div>
              <div className={`${commonStyles.row} ${styles.row}`}>
                <span className={`${commonStyles.label} ${styles.label}`}>Controlled By:</span>
                <span className={commonStyles.value}>
                  {(() => {
                    const player = gameState?.getPlayer(gameState.getLandOwner(land.mapPos));
                    return player ? player.getName() : NO_PLAYER.name;
                  })()}
                </span>
              </div>
              {land.buildings && land.buildings.length > 0 && (
                <div className={`${commonStyles.row} ${styles.row}`}>
                  <span className={`${commonStyles.label} ${styles.label}`}>Buildings:</span>
                  <div className={styles.buildingsList}>
                    {land.buildings.map((building, index) => (
                      <span key={index} className={styles.building}>
                        {building.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(heroes.length > 0 || units.length > 0) && (
                <>
                  {heroes.length > 0 && (
                    <div className={`${commonStyles.row} ${styles.row}`}>
                      <span className={`${commonStyles.label} ${styles.label}`}>Heroes:</span>
                      <div className={styles.buildingsList}>
                        {heroes.map((hero) => (
                          <span key={hero.name} className={styles.hero}>
                            {hero.name} lvl: {hero.level}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {units.length > 0 && (
                    <div className={`${commonStyles.row} ${styles.row}`}>
                      <span className={`${commonStyles.label} ${styles.label}`}>Units:</span>
                      <div className={styles.buildingsList}>
                        {units.map((unit) => (
                          <span key={unit.id} className={commonStyles.value}>
                            {unit.id} ({unit.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </PopupWrapper>
  );
};

export default LandCharacteristicsPopup;
