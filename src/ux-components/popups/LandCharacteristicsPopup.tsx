import React from 'react';
import commonStyles from './css/Popup.module.css';
import styles from './css/LandCharacteristicsPopup.module.css';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { battlefieldLandId, getPlayerById } from '../../types/GameState';

import PopupWrapper, { PopupProps } from './PopupWrapper';

import { getAlignmentColor } from '../../types/Alignment';
import { NO_PLAYER } from '../../types/GamePlayer';
import { LandPosition } from '../../map/utils/getLands';
import { useGameContext } from '../../contexts/GameContext';
import { HeroUnit, isHero, RegularUnit } from '../../types/Army';

interface LandCharacteristicsPopupProps extends PopupProps {
  battlefieldPosition: LandPosition;
}

const LandCharacteristicsPopup: React.FC<LandCharacteristicsPopupProps> = ({
  battlefieldPosition,
  screenPosition,
}) => {
  const { hideLandPopup } = useApplicationContext();
  const { gameState } = useGameContext();
  const land = gameState!.battlefield.lands[battlefieldLandId(battlefieldPosition)];

  // Calculate dynamic size based on content type
  // MANUAL ADJUSTMENT POINT 1: Base heights and row spacing
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
  const heroes = land.army
    .filter(({ units }) => units.some((unit) => isHero(unit)))
    .flatMap((a) => a.units.map((u) => u as HeroUnit));
  const units = land.army
    .filter(({ units }) => units.some((unit) => !isHero(unit)))
    .flatMap((a) => a.units.map((u) => u as RegularUnit));

  if (heroes.length > 0) {
    calculatedHeight += heroes.length * armyRowHeight;
  }

  if (units.length > 0) {
    calculatedHeight += units.length * armyRowHeight;
  }

  // MANUAL ADJUSTMENT POINT 2: Final height calculation
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
                    const player = getPlayerById(gameState, land.controlledBy);
                    return player ? player.name : NO_PLAYER.name;
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
                          <span key={hero.name} className={styles.building}>
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
