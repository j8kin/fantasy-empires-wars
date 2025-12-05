import React from 'react';
import styles from './css/Hexagonal.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import LandCharacteristicsPopup from '../popups/LandCharacteristicsPopup';

import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';
import { getLandOwner } from '../../selectors/landSelectors';
import { getPlayer, getRealmLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { getBuilding } from '../../selectors/buildingSelectors';

import { SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';
import { getPlayerColorValue } from '../../domain/ui/playerColors';
import { calculateTileScreenPosition, getMapDimensions } from '../../utils/screenPositionUtils';

import { construct } from '../../map/building/construct';
import { castSpell } from '../../map/magic/castSpell';
import { calcMaxMove, MAX_MOVE } from '../../map/move-army/calcMaxMove';
import { MIN_HERO_PACKS } from '../../map/move-army/startMovement';
import { getTilesInRadius } from '../../map/utils/mapAlgorithms';

import { getLandImg } from '../../assets/getLandImg';

interface HexTileProps {
  battlefieldPosition: LandPosition;
}

const LandTile: React.FC<HexTileProps> = ({ battlefieldPosition }) => {
  const {
    landPopupPosition,
    landPopupScreenPosition,
    showLandPopup,
    glowingTiles,
    clearAllGlow,
    selectedLandAction,
    setSelectedLandAction,
    setShowRecruitArmyDialog,
    setShowSendHeroInQuestDialog,
    setActionLandPosition,
    actionLandPosition,
    addGlowingTile,
    setMoveArmyPath,
    showSpellAnimation,
  } = useApplicationContext();
  const { gameState, updateGameState } = useGameContext();

  const showPopup =
    landPopupPosition?.row === battlefieldPosition.row &&
    landPopupPosition?.col === battlefieldPosition.col;

  const battlefieldTile = gameState!.map.lands[getLandId(battlefieldPosition)];

  if (!battlefieldTile) {
    return <div className={styles.hexTile} title="Empty Tile" />;
  }

  const imageSrc = getLandImg(battlefieldTile.land.id);
  const altText = battlefieldTile.land.id;

  // Get the controlling player's color or default to white if not controlled
  const getBackgroundColor = (): string => {
    if (gameState == null) return 'white';
    const controllingPlayer = getPlayer(gameState, getLandOwner(gameState, battlefieldTile.mapPos));
    return getPlayerColorValue(controllingPlayer?.color ?? 'white');
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    showLandPopup(battlefieldPosition, { x: event.clientX, y: event.clientY });
  };

  const tileId = getLandId(battlefieldPosition);
  const isGlowing = glowingTiles.has(tileId) || battlefieldTile.glow;

  const handleClick = (event: React.MouseEvent) => {
    if (gameState && isGlowing) {
      event.preventDefault();
      event.stopPropagation(); // Prevent the battlefield click handler from firing

      if (selectedLandAction?.startsWith('Spell: ')) {
        const spellToCast = getSpellById(selectedLandAction?.substring(7) as SpellName);
        const selectedPlayer = gameState?.turnOwner;
        if (selectedPlayer && gameState) {
          // Calculate screen position for animation
          const mapDimensions = getMapDimensions(gameState);
          const screenPosition = calculateTileScreenPosition(battlefieldPosition, mapDimensions);

          // Start spell cast animation in MainView
          showSpellAnimation(spellToCast.manaType, battlefieldPosition, screenPosition);

          castSpell(spellToCast, battlefieldPosition, gameState!);
          updateGameState(gameState!);

          // Show success message after a short delay to let animation start
          setTimeout(() => {
            alert(`Cast ${spellToCast.id} on Land ${tileId}.`);
          }, 100);
        }
      } else if (selectedLandAction?.startsWith('Building: ')) {
        const buildingToConstruct = selectedLandAction?.substring(10) as BuildingType;
        const selectedPlayer = getTurnOwner(gameState);
        if (selectedPlayer && selectedPlayer.vault! >= getBuilding(buildingToConstruct).buildCost) {
          // todo add animation for building
          construct(gameState!, buildingToConstruct, battlefieldPosition);
          updateGameState(gameState!);
        }
      } else if (selectedLandAction === 'Recruit') {
        // Handle recruit action - store the selected land position and show dialog
        setActionLandPosition(battlefieldPosition);
        setShowRecruitArmyDialog(true);
      } else if (selectedLandAction === 'Quest') {
        // Handle quest action - store the selected land position and show dialog
        setActionLandPosition(battlefieldPosition);
        setShowSendHeroInQuestDialog(true);
      } else if (selectedLandAction === 'MoveArmyFrom') {
        clearAllGlow();
        setActionLandPosition(battlefieldPosition); // store Move Army From position
        setSelectedLandAction('MoveArmyTo');

        const realmLands = getRealmLands(gameState!).map((l) => l.mapPos);
        const armiesAtPosition = getArmiesAtPosition(gameState!, battlefieldPosition);
        const maxMovements = calcMaxMove(armiesAtPosition.flatMap((a) => a.regulars));
        const nHeroes = armiesAtPosition.reduce((acc, army) => acc + army.heroes.length, 0);
        const landsInRadius = getTilesInRadius(
          gameState!.map.dimensions,
          battlefieldPosition,
          nHeroes >= MIN_HERO_PACKS ? MAX_MOVE : maxMovements
        );

        const moveToLands: LandPosition[] = Array.from(
          new Map<string, LandPosition>(
            [...realmLands, ...landsInRadius].map((pos): [string, LandPosition] => [
              `${pos.row}:${pos.col}`,
              pos,
            ])
          ).values()
        );

        moveToLands.forEach((land) => addGlowingTile(getLandId(land)));

        return;
      } else if (selectedLandAction === 'MoveArmyTo') {
        setMoveArmyPath({ from: actionLandPosition!, to: battlefieldPosition });
      } else {
        alert(
          `Unknown action for Land ${tileId}. Action item: ${JSON.stringify(selectedLandAction)}`
        );
      }
      clearAllGlow();
      setSelectedLandAction(null); // Clear selected item after action is performed
    }
  };

  const tileClassName = `${styles.hexTile} ${
    isGlowing ? styles['hexTile--glowing'] : styles['hexTile--normal']
  }`;

  return (
    <>
      <div
        className={tileClassName}
        title={`${battlefieldTile.land.id} (${battlefieldTile.land.alignment})`}
        onContextMenu={handleRightClick}
        onClick={handleClick}
        style={{ backgroundColor: getBackgroundColor() }}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={altText} className={styles.hexTileImg} />
        ) : (
          <p>no image</p>
        )}
      </div>
      {showPopup && (
        <LandCharacteristicsPopup
          battlefieldPosition={battlefieldPosition}
          screenPosition={landPopupScreenPosition}
        />
      )}
    </>
  );
};

export default LandTile;
