import React, { useState } from 'react';
import styles from './css/GameButton.module.css';
import LoadGame from '../../assets/buttons/LoadGame.png';
import { GameButtonProps } from './GameButtonProps';
import ConstructBuildingDialog from '../dialogs/ConstructBuildingDialog';

const LoadGameButton: React.FC<GameButtonProps> = ({ onClick }) => {
  const [isConstructDialogOpen, setIsConstructDialogOpen] = useState(false);

  const handleLoadGame = () => {
    setIsConstructDialogOpen(true);
    if (onClick) {
      onClick();
    }
  };

  const handleConstructDialogClose = () => {
    setIsConstructDialogOpen(false);
  };

  const handleConstruct = (buildingId: string) => {
    console.log('Constructing building:', buildingId);
    // Add actual construction logic here
  };

  const handleCancel = () => {
    console.log('Construction cancelled');
  };

  return (
    <>
      <img src={LoadGame} alt="Load Game" className={styles.buttonImage} onClick={handleLoadGame} />
      <ConstructBuildingDialog
        isOpen={isConstructDialogOpen}
        onClose={handleConstructDialogClose}
        building={null} // Will use sample building data
        onConstruct={handleConstruct}
        onCancel={handleCancel}
      />
    </>
  );
};

export default LoadGameButton;
