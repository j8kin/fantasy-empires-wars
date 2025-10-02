import React from 'react';
import BookDialog, { BookPageContent } from './BookDialog';
import styles from './css/BookDialog.module.css';
import { Building, BuildingType, getBuilding } from '../../types/Building';

export interface ConstructBuildingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConstruct?: (buildingId: BuildingType) => void;
  onCancel?: () => void;
}

const ConstructBuildingDialog: React.FC<ConstructBuildingDialogProps> = ({
  isOpen,
  onClose,
  onConstruct,
}) => {
  const selectedBuilding = BuildingType.STRONGHOLD;
  const handleConstruct = () => {
    if (onConstruct) {
      onConstruct(selectedBuilding);
    }
    onClose();
  };

  // Left page content - Building image and basic info
  const leftPageContent = (building: Building) => (
    <>
      <img
        src={building.image}
        alt={building.name}
        className={styles.buildingImage}
        onError={(e) => {
          // Fallback to a placeholder or hide image on error
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className={styles.buildingName}>{building.name}</div>

      <div className={styles.costSection}>
        <h4 style={{ margin: '0 0 10px 0', color: '#5d4037', fontSize: '1.1rem' }}>Build Cost:</h4>
        <span className={styles.costValue}>{building.buildCost}</span>
      </div>

      {Object.keys(building.maintainCost).length > 0 && (
        <div className={styles.costSection}>
          <h4 style={{ margin: '0 0 10px 0', color: '#5d4037', fontSize: '1.1rem' }}>
            Maintain Cost:
          </h4>
          <span className={styles.costValue}>{building.maintainCost}</span>
        </div>
      )}
    </>
  );

  // Right page content - Description and effects
  const rightPageContent = (building: Building) => (
    <>
      <div className={styles.description}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2c1810' }}>Description:</h4>
        <p style={{ margin: 0 }}>{building.description}</p>
      </div>

      {building.description && (
        <div className={styles.description}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c1810' }}>Requirements:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>{building.description}</ul>
        </div>
      )}

      <div className={styles.actionButtons}>
        <button
          className={`${styles.actionButton} ${styles.confirmButton}`}
          onClick={handleConstruct}
        >
          Build
        </button>
      </div>
    </>
  );

  const pages: BookPageContent[] = [
    {
      content: leftPageContent(getBuilding(BuildingType.STRONGHOLD)),
      pageNumber: 'I',
    },
    {
      content: rightPageContent(getBuilding(BuildingType.STRONGHOLD)),
      pageNumber: 'II',
    },
  ];

  return <BookDialog isOpen={isOpen} onClose={onClose} pages={pages} title="Construction Plans" />;
};

export default ConstructBuildingDialog;
