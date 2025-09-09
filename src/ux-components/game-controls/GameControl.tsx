import React, { useState } from 'react';
import styles from './css/GameControl.module.css';
import NewGameButton from '../buttons/NewGameButton';
import LoadGameButton from '../buttons/LoadGameButton';
import SaveGameButton from '../buttons/SaveGameButton';
import SaveGameDialog from '../dialogs/SaveGameDialog';

interface GameControlProps {
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onSaveGame?: (saveName: string) => void;
}

const GameControl: React.FC<GameControlProps> = ({ onNewGame, onLoadGame, onSaveGame }) => {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const handleSaveGameClick = () => {
    setIsSaveDialogOpen(true);
  };

  const handleSaveGame = (saveName: string) => {
    if (onSaveGame) {
      onSaveGame(saveName);
    }
  };

  const handleCloseSaveDialog = () => {
    setIsSaveDialogOpen(false);
  };

  return (
    <>
      <div className={styles.gameControlContainer}>
        <NewGameButton onClick={onNewGame} />
        <LoadGameButton onClick={onLoadGame} />
        <SaveGameButton onClick={handleSaveGameClick} />
      </div>
      <SaveGameDialog
        isOpen={isSaveDialogOpen}
        onClose={handleCloseSaveDialog}
        onSave={handleSaveGame}
      />
    </>
  );
};

export default GameControl;
