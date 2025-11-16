import React from 'react';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import { ButtonName } from '../../types/ButtonName';
import GameButton from '../buttons/GameButton';
import { startMovement } from '../../map/move-army/startMovement';
import { getLand } from '../../map/utils/getLands';

const MoveArmyDialog: React.FC = () => {
  const { setMoveArmyPath, moveArmyPath } = useApplicationContext();
  const { gameState } = useGameContext();

  if (!moveArmyPath || !gameState) return null;

  const stationedArmy = getLand(gameState, moveArmyPath.from).army.filter(
    (a) => a.movements == null
  );

  if (stationedArmy == null || stationedArmy.length === 0) return null;
  const units = stationedArmy[0].units;

  const handleMove = () => {
    setMoveArmyPath(undefined);

    startMovement(moveArmyPath?.from, moveArmyPath?.to, units, gameState);
  };
  const handleClose = () => {
    setMoveArmyPath(undefined);
  };

  // Center the dialog on screen (assuming 1920x1080 viewport)
  const dialogWidth = 730;
  const dialogHeight = 500;
  const x = (window.innerWidth - dialogWidth) / 2;
  const y = (window.innerHeight - dialogHeight) / 2;

  return (
    <div data-testid="SaveGameDialog">
      <FantasyBorderFrame
        screenPosition={{ x, y }}
        frameSize={{ width: dialogWidth, height: dialogHeight }}
        primaryButton={<GameButton buttonName={ButtonName.MOVE} onClick={handleMove} />}
        secondaryButton={<GameButton buttonName={ButtonName.CANCEL} onClick={handleClose} />}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>Move Army</div>
      </FantasyBorderFrame>
    </div>
  );
};

export default MoveArmyDialog;
