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
  const pageContent = (building: Building) => (
    <>
      <div className={styles.buildingName}>{building.name}</div>
      <img
        src={building.image}
        alt={building.name}
        className={styles.buildingImage}
        onError={(e) => {
          // Fallback to a placeholder or hide image on error
          e.currentTarget.style.display = 'none';
        }}
        onClick={handleConstruct}
      />
      <div className={styles.description}>
        <h4 style={{ margin: '0 0 8px 0', color: '#2c1810', fontSize: '1rem' }}>Description:</h4>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>{building.description}</p>
      </div>

      <div className={styles.costSection}>
        <h4 style={{ margin: '0 0 5px 0', color: '#5d4037', fontSize: '1rem' }}>Build Cost:</h4>
        <span className={styles.costValue}>{building.buildCost}</span>
      </div>

      <div className={styles.costSection}>
        <h4 style={{ margin: '0 0 5px 0', color: '#5d4037', fontSize: '1rem' }}>Maintain Cost:</h4>
        <span className={styles.costValue}>{building.maintainCost}</span>
      </div>
    </>
  );

  const pages: BookPageContent[] = Object.values(BuildingType).map((b) => ({
    content: pageContent(getBuilding(b)),
    pageNumber: 'I',
  }));

  return <BookDialog isOpen={isOpen} onClose={onClose} pages={pages} />;
};

export default ConstructBuildingDialog;
