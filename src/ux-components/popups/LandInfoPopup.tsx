import React from 'react';
import commonStyles from './css/Popup.module.css';
import styles from './css/LandCharacteristicsPopup.module.css';

import PopupWrapper from './PopupWrapper';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getLandInfo } from '../../selectors/landSelectors';
import { getAlignmentColor } from '../../domain/ui/alignmentColors';
import { EffectKind } from '../../types/Effect';

import type { PopupProps } from './PopupWrapper';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { EffectType } from '../../types/Effect';

interface LandCharacteristicsPopupProps extends PopupProps {
  landPos: LandPosition;
}

const getEffectColor = (effectType: EffectType): string => {
  switch (effectType) {
    case EffectKind.POSITIVE:
      return '#4CAF50';
    case EffectKind.NEGATIVE:
      return '#F44336';
    case EffectKind.PERMANENT:
      return '#344ceb';
  }
};

const LandInfoPopup: React.FC<LandCharacteristicsPopupProps> = ({ landPos, screenPosition }) => {
  const { hideLandPopup } = useApplicationContext();
  const { gameState } = useGameContext();
  if (gameState == null) return null;

  const landInfo = getLandInfo(gameState, landPos);

  // Calculate dynamic size based on content type
  //  Base heights and row spacing
  const headerHeight = 34; // Header with title (6px padding * 2 + 20px content)
  const standardRowHeight = 21; // Height per standard data row (Alignment, ControlledBy etc) (12px font + 6px margin)
  const buildingRowHeight = 24; // Height for building rows (includes building chip padding + gaps)
  const armyRowHeight = 21; // Height for army row (standard)
  const effectRowHeight = 21; // Height for effect row (standard)

  // Calculate height for each content type separately
  // Standard rows: Alignment, Position, Gold per Turn, Controlled By
  let calculatedHeight = headerHeight + 4 * standardRowHeight + 15;

  // Handle illusion case - only show illusion message
  if (landInfo.illusionMsg) {
    calculatedHeight += armyRowHeight; // Height for illusion message
  } else {
    // Buildings row - accounts for building chips and their styling
    if (landInfo.buildings.length > 0) {
      calculatedHeight += landInfo.buildings.length * buildingRowHeight;
    }

    // Effects rows - use landInfo data
    if (landInfo.effects.length > 0) {
      calculatedHeight += landInfo.effects.length * effectRowHeight;
    }

    // Army rows - use landInfo data
    if (landInfo.heroes.length > 0) {
      calculatedHeight += landInfo.heroes.length * armyRowHeight;
    }

    if (landInfo.regulars.length > 0) {
      calculatedHeight += landInfo.regulars.length * armyRowHeight;
    }
    if (landInfo.warMachines.length > 0) {
      calculatedHeight += landInfo.warMachines.length * armyRowHeight;
    }
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
          <h3 className={`${commonStyles.title} ${styles.title}`}>
            {(landInfo.isCorrupted ? 'Corrupted ' : '') + landInfo.type}
          </h3>
        </div>

        <div className={commonStyles.characteristics}>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Alignment:</span>
            <span className={commonStyles.value} style={{ color: getAlignmentColor(landInfo.alignment) }}>
              {landInfo.alignment}
            </span>
          </div>

          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Position:</span>
            <span className={commonStyles.value}>
              {landPos.row}, {landPos.col}
            </span>
          </div>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Gold per Turn:</span>
            <span className={commonStyles.value}>{landInfo.goldPerTurn}</span>
          </div>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Controlled By:</span>
            <span className={commonStyles.value} style={{ color: landInfo.color }} data-testid="owner">
              {landInfo.owner}
            </span>
          </div>
          {landInfo.illusionMsg ? (
            <div className={`${commonStyles.row} ${styles.row}`}>
              <span className={commonStyles.label} style={{ fontStyle: 'italic', color: '#888' }}>
                {landInfo.illusionMsg}
              </span>
            </div>
          ) : (
            <>
              {landInfo.buildings && landInfo.buildings.length > 0 && (
                <div className={`${commonStyles.row} ${styles.row}`}>
                  <span className={`${commonStyles.label} ${styles.label}`}>Buildings:</span>
                  <div className={styles.buildingsList}>
                    {landInfo.buildings.map((building, index) => (
                      <span key={index} className={styles.building}>
                        {building}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {landInfo.effects.length > 0 && (
                <div className={`${commonStyles.row} ${styles.row}`}>
                  <span className={`${commonStyles.label} ${styles.label}`}>Effects:</span>
                  <div className={styles.buildingsList}>
                    {landInfo.effects.map((effect, index) => (
                      <span key={index} className={styles.hero} style={{ color: getEffectColor(effect.rules.type) }}>
                        {effect.sourceId} ({effect.rules.duration})
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(landInfo.heroes.length > 0 || landInfo.regulars.length > 0 || landInfo.warMachines.length > 0) && (
                <>
                  {landInfo.heroes.length > 0 && (
                    <div className={`${commonStyles.row} ${styles.row}`}>
                      <span className={`${commonStyles.label} ${styles.label}`}>Heroes:</span>
                      <div className={styles.buildingsList}>
                        {landInfo.heroes.map((hero, index) => (
                          <span key={index} className={styles.hero}>
                            {hero}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {landInfo.regulars.length > 0 && (
                    <div className={`${commonStyles.row} ${styles.row}`}>
                      <span className={`${commonStyles.label} ${styles.label}`}>Units:</span>
                      <div className={styles.buildingsList}>
                        {landInfo.regulars.map((unit, index) => (
                          <span key={index} className={commonStyles.value}>
                            {unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {landInfo.warMachines.length > 0 && (
                    <div className={`${commonStyles.row} ${styles.row}`}>
                      <span className={`${commonStyles.label} ${styles.label}`}>War Machines:</span>
                      <div className={styles.buildingsList}>
                        {landInfo.warMachines.map((unit, index) => (
                          <span key={index} className={commonStyles.value}>
                            {unit}
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

export default LandInfoPopup;
