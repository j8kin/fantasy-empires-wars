import React from 'react';
import styles from './css/Hexagonal.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';

import LandInfoPopup from '../popups/LandInfoPopup';

import { getLandId } from '../../state/map/land/LandId';
import {
  getLandOwner,
  getPlayerLands,
  getRealmLands,
  getTilesInRadius,
} from '../../selectors/landSelectors';
import { getPlayer, getTreasureItemById, getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPosition } from '../../selectors/armySelectors';
import { getSpellById } from '../../selectors/spellSelectors';
import { getBuildingInfo } from '../../domain/building/buildingRepository';
import { getPlayerColorValue } from '../../domain/ui/playerColors';
import { calculateTileScreenPosition, getMapDimensions } from '../../utils/screenPositionUtils';
import { construct } from '../../map/building/construct';
import { castSpell } from '../../map/magic/castSpell';
import { invokeItem } from '../../map/magic/invokeItem';
import { calcMaxMove } from '../../map/move-army/calcMaxMove';
import { getRandomElement } from '../../domain/utils/random';
import { MAX_MOVE } from '../../map/move-army/calcMaxMove';
import { MIN_HERO_PACKS } from '../../map/move-army/startMovement';
import { SpellName } from '../../types/Spell';
import { EmpireEventKind } from '../../types/EmpireEvent';

import { getLandImg } from '../../assets/getLandImg';

import type { SpellType } from '../../types/Spell';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { BuildingType } from '../../types/Building';
import type { TreasureType } from '../../types/Treasures';

export interface HexTileProps {
  mapPosition: LandPosition;
}

const LandTile: React.FC<HexTileProps> = ({ mapPosition }) => {
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
    showEmpireEvents,
  } = useApplicationContext();
  const { gameState, updateGameState } = useGameContext();

  const showPopup =
    landPopupPosition?.row === mapPosition.row && landPopupPosition?.col === mapPosition.col;

  const battlefieldTile = gameState!.map.lands[getLandId(mapPosition)];

  if (!battlefieldTile) {
    return <div className={styles.hexTile} title="Empty Tile" data-testid="land-tile" />;
  }

  const imageSrc = getLandImg(battlefieldTile);
  const altText = battlefieldTile.land.id;

  // Get the controlling player's color or default to white if not controlled
  const getBackgroundColor = (): string => {
    if (gameState == null) return 'white';
    const controllingPlayer = getPlayer(gameState, getLandOwner(gameState, battlefieldTile.mapPos));
    return getPlayerColorValue(controllingPlayer?.color ?? 'white');
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    showLandPopup(mapPosition, { x: event.clientX, y: event.clientY });
  };

  const tileId = getLandId(mapPosition);
  const isGlowing = glowingTiles.has(tileId) || battlefieldTile.glow;

  const handleClick = (event: React.MouseEvent) => {
    if (gameState && isGlowing) {
      event.preventDefault();
      event.stopPropagation(); // Prevent the battlefield click handler from firing

      if (selectedLandAction?.startsWith('Spell: ')) {
        if (selectedLandAction?.includes(SpellName.TELEPORT)) {
          // Teleport spell require 2 stages of Land selection - first select the source Land, then the destination Land
          if (selectedLandAction?.includes('TeleportTo')) {
            const spellToCast = getSpellById(SpellName.TELEPORT);
            const screenPosition = calculateTileScreenPosition(
              mapPosition,
              getMapDimensions(gameState)
            );
            showSpellAnimation(spellToCast.manaType, mapPosition, screenPosition);

            castSpell(gameState, SpellName.TELEPORT, actionLandPosition!, mapPosition);
            clearAllGlow();
            setSelectedLandAction(null); // Clear selected item after action is performed
            return;
          }

          clearAllGlow();
          setActionLandPosition(mapPosition); // store Teleport Army From position
          setSelectedLandAction(`${selectedLandAction}To`);

          // glow all player lands
          getPlayerLands(gameState)
            .flatMap((l) => getLandId(l.mapPos))
            .filter((l) => l !== tileId)
            .forEach((l) => addGlowingTile(l));

          return;
        }
        const spellToCast = getSpellById(selectedLandAction?.substring(7) as SpellType);
        const selectedPlayer = gameState?.turnOwner;
        if (selectedPlayer) {
          // Calculate screen position for animation
          const mapDimensions = getMapDimensions(gameState);
          const screenPosition = calculateTileScreenPosition(mapPosition, mapDimensions);

          // Start spell cast animation in MainView
          showSpellAnimation(spellToCast.manaType, mapPosition, screenPosition);

          castSpell(gameState, spellToCast.type, mapPosition);
          updateGameState(gameState);
        }
      } else if (selectedLandAction?.startsWith('Item: ')) {
        const itemId = selectedLandAction?.substring(6); // UUID allow using exact item when it is more than 1 in treasures
        if (itemId) {
          const item = getTreasureItemById(getTurnOwner(gameState), itemId)!;
          invokeItem(gameState, itemId, mapPosition);
          if (!getTreasureItemById(getTurnOwner(gameState), itemId)) {
            // item is not invoked since no charges
            showEmpireEvents([
              {
                status: EmpireEventKind.Negative,
                message: itemLostMessage(item.treasure.type),
              },
            ]);
          }
          updateGameState(gameState);
        }
      } else if (selectedLandAction?.startsWith('Building: ')) {
        const buildingToConstruct = selectedLandAction?.substring(10) as BuildingType;
        const selectedPlayer = getTurnOwner(gameState);
        if (
          selectedPlayer &&
          selectedPlayer.vault! >= getBuildingInfo(buildingToConstruct).buildCost
        ) {
          // todo add animation for building
          construct(gameState, buildingToConstruct, mapPosition);
          updateGameState(gameState);
        }
      } else if (selectedLandAction === 'Recruit') {
        // Handle recruit action - store the selected land position and show dialog
        setActionLandPosition(mapPosition);
        setShowRecruitArmyDialog(true);
      } else if (selectedLandAction === 'Quest') {
        // Handle quest action - store the selected land position and show dialog
        setActionLandPosition(mapPosition);
        setShowSendHeroInQuestDialog(true);
      } else if (selectedLandAction === 'MoveArmyFrom') {
        clearAllGlow();
        setActionLandPosition(mapPosition); // store Move Army From position
        setSelectedLandAction('MoveArmyTo');

        const realmLands = getRealmLands(gameState).map((l) => l.mapPos);
        const armiesAtPosition = getArmiesAtPosition(gameState!, mapPosition);
        const maxMovements = calcMaxMove(armiesAtPosition.flatMap((a) => a.regulars));
        const nHeroes = armiesAtPosition.reduce((acc, army) => acc + army.heroes.length, 0);
        const landsInRadius = getTilesInRadius(
          gameState!.map.dimensions,
          mapPosition,
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
        setMoveArmyPath({ from: actionLandPosition!, to: mapPosition });
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
        onContextMenu={handleRightClick}
        onClick={handleClick}
        style={{ backgroundColor: getBackgroundColor() }}
        data-testid="land-tile"
      >
        {imageSrc ? (
          <img src={imageSrc} alt={altText} className={styles.hexTileImg} />
        ) : (
          <p>no image</p>
        )}
      </div>
      {showPopup && (
        <LandInfoPopup landPos={mapPosition} screenPosition={landPopupScreenPosition} />
      )}
    </>
  );
};

export default LandTile;

const itemLostMessage = (item: TreasureType): string => {
  const message = [
    `With a final whisper, ${item} crumbles into lifeless dust.`,
    `The magic bound to ${item} fades, leaving only ash behind.`,
    `A hollow echo rings as ${item} shatters into nothingness.`,
    `The power within ${item} collapses, undone by its own use.`,
    `Orrivane reclaims what was borrowed—${item} is no more.`,
    `Bound power disperses; ${item} has served its final hour.`,
    `${item} breaks, spent beyond recovery.`,
    `Nothing remains of ${item} but scattered fragments.`,
  ];
  return getRandomElement(message);
};
