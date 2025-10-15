import React from 'react';
import commonStyles from './css/Popup.module.css';
import styles from './css/LandCharacteristicsPopup.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { battlefieldLandId, getPlayerById } from '../../types/GameState';

import PopupWrapper, { PopupProps } from './PopupWrapper';

import { getAlignmentColor } from '../../types/Alignment';
import { NO_PLAYER } from '../../types/GamePlayer';
import { LandPosition } from '../../map/utils/mapLands';
import { useGameContext } from '../../contexts/GameContext';

interface LandCharacteristicsPopupProps extends PopupProps {
  battlefieldPosition: LandPosition;
}

const LandCharacteristicsPopup: React.FC<LandCharacteristicsPopupProps> = ({
  battlefieldPosition,
  screenPosition,
}) => {
  const { hideLandPopup } = useApplicationContext();
  const { gameState } = useGameContext();
  const battlefieldTile = gameState!.battlefieldLands[battlefieldLandId(battlefieldPosition)];
  if (!battlefieldTile) return null;
  const displayLandType = battlefieldTile.land;
  if (!displayLandType) return null;

  // Calculate dynamic size based on content type
  // MANUAL ADJUSTMENT POINT 1: Base heights and row spacing
  const headerHeight = 33; // Header with title (6px padding * 2 + 20px content)
  const baseContentPadding = 15; // Top and bottom padding for characteristics (8px * 2)
  const standardRowHeight = 21; // Height per standard data row (12px font + 6px margin)
  const buildingRowHeight = 24; // Height for building rows (includes building chip padding + gaps)
  const armyRowHeight = 18; // Height for army row (standard)

  // Calculate height for each content type separately
  let totalContentHeight = 0;

  // Standard rows: Alignment, Position, Gold per Turn, Controlled By
  totalContentHeight += 4 * standardRowHeight;

  // Buildings row - accounts for building chips and their styling
  if (battlefieldTile?.buildings && battlefieldTile.buildings.length > 0) {
    const buildingChipHeight = 16; // 10px font + 2px padding * 2 + 2px gap
    const buildingRows = Math.ceil(battlefieldTile.buildings.length / 3); // Estimate wrapping
    totalContentHeight += buildingRowHeight + (buildingRows - 1) * buildingChipHeight;
  }

  // Army rows - separate heroes and units
  if (battlefieldTile?.army && battlefieldTile.army.length > 0) {
    const heroes = battlefieldTile.army.filter(({ unit }) => unit.hero);
    const units = battlefieldTile.army.filter(({ unit }) => !unit.hero);

    if (heroes.length > 0) {
      const heroRows = Math.ceil(heroes.length / 3); // Estimate wrapping
      totalContentHeight += buildingRowHeight + (heroRows - 1) * armyRowHeight;
    }

    if (units.length > 0) {
      const unitRows = Math.ceil(units.length / 2); // Units might wrap less efficiently
      totalContentHeight += buildingRowHeight + (unitRows - 1) * armyRowHeight;
    }
  }

  // MANUAL ADJUSTMENT POINT 2: Final height calculation
  const calculatedHeight = headerHeight + baseContentPadding + totalContentHeight;
  const dynamicHeight = Math.min(calculatedHeight, 270); // MANUAL ADJUSTMENT POINT 3: Max height limit
  const dynamicWidth = 320;

  return (
    <PopupWrapper
      screenPosition={{ x: screenPosition.x + 10, y: screenPosition.y + 10 }}
      dimensions={{ width: dynamicWidth, height: dynamicHeight + 30 }}
      onClose={hideLandPopup}
    >
      <div className={commonStyles.popupContent}>
        <div className={`${commonStyles.header} ${styles.header}`}>
          <h3 className={`${commonStyles.title} ${styles.title}`}>{displayLandType.id}</h3>
        </div>

        <div className={commonStyles.characteristics}>
          <div className={`${commonStyles.row} ${styles.row}`}>
            <span className={`${commonStyles.label} ${styles.label}`}>Alignment:</span>
            <span
              className={commonStyles.value}
              style={{ color: getAlignmentColor(displayLandType.alignment) }}
            >
              {displayLandType.alignment}
            </span>
          </div>

          {battlefieldTile && (
            <>
              <div className={`${commonStyles.row} ${styles.row}`}>
                <span className={`${commonStyles.label} ${styles.label}`}>Position:</span>
                <span className={commonStyles.value}>
                  {battlefieldPosition.row}, {battlefieldPosition.col}
                </span>
              </div>

              <div className={`${commonStyles.row} ${styles.row}`}>
                <span className={`${commonStyles.label} ${styles.label}`}>Gold per Turn:</span>
                <span className={commonStyles.value}>{battlefieldTile.goldPerTurn}</span>
              </div>

              <div className={`${commonStyles.row} ${styles.row}`}>
                <span className={`${commonStyles.label} ${styles.label}`}>Controlled By:</span>
                <span className={commonStyles.value}>
                  {(() => {
                    const player = getPlayerById(gameState, battlefieldTile.controlledBy);
                    return player ? player.name : NO_PLAYER.name;
                  })()}
                </span>
              </div>

              {battlefieldTile.buildings && battlefieldTile.buildings.length > 0 && (
                <div className={`${commonStyles.row} ${styles.row}`}>
                  <span className={`${commonStyles.label} ${styles.label}`}>Buildings:</span>
                  <div className={styles.buildingsList}>
                    {battlefieldTile.buildings.map((building, index) => (
                      <span key={index} className={styles.building}>
                        {building.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {battlefieldTile.army && battlefieldTile.army.length > 0 && (
                <>
                  {battlefieldTile.army.some(({ unit }) => unit.hero) && (
                    <div className={`${commonStyles.row} ${styles.row}`}>
                      <span className={`${commonStyles.label} ${styles.label}`}>Heroes:</span>
                      <div className={styles.buildingsList}>
                        {battlefieldTile.army
                          .filter(({ unit }) => unit.hero)
                          .map(({ unit }, index) => (
                            <span key={index} className={styles.building}>
                              {unit.name} lvl: {unit.level}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {battlefieldTile.army.some(({ unit }) => !unit.hero) && (
                    <div className={`${commonStyles.row} ${styles.row}`}>
                      <span className={`${commonStyles.label} ${styles.label}`}>Units:</span>
                      <div className={styles.buildingsList}>
                        {battlefieldTile.army
                          .filter(({ unit }) => !unit.hero)
                          .map(({ unit, quantity }, index) => (
                            <span key={index} className={commonStyles.value}>
                              {unit.name} ({quantity})
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
