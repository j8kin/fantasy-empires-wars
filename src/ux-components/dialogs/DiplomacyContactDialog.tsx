import React, { Activity } from 'react';
import styles from './css/DiplomacyContactDialog.module.css';

import FantasyBorderFrame from '../fantasy-border-frame/FantasyBorderFrame';
import GameButton from '../buttons/GameButton';
import Avatar from '../avatars/Avatar';

import { useApplicationContext } from '../../contexts/ApplicationContext';
import { useGameContext } from '../../contexts/GameContext';
import { getTurnOwner } from '../../selectors/playerSelectors';
import { getAlignmentColor } from '../../domain/ui/alignmentColors';
import { DiplomacyStatus } from '../../types/Diplomacy';
import { ButtonName } from '../../types/ButtonName';
import { NO_PLAYER } from '../../domain/player/playerRepository';

const DiplomacyContactDialog: React.FC = () => {
  const { diplomacyContactOpponent, showDiplomacyContactDialog, hideDiplomacyContact } = useApplicationContext();
  const { gameState } = useGameContext();

  if (gameState == null) return null; // initial fallback when game not started

  const turnOwner = getTurnOwner(gameState);
  const diplomacyStatus =
    turnOwner.diplomacy[diplomacyContactOpponent?.id ?? NO_PLAYER.id]?.status ?? DiplomacyStatus.NO_TREATY;

  const handleClose = () => {
    hideDiplomacyContact();
  };

  const handleDeclareWar = () => {
    // TODO: Implement declare war logic
    console.log('Declare War on', diplomacyContactOpponent?.playerProfile.name);
  };

  const handleAskForPeace = () => {
    // TODO: Implement ask for peace logic
    console.log('Ask for Peace with', diplomacyContactOpponent?.playerProfile.name);
  };

  const handleAskForAlliance = () => {
    // TODO: Implement ask for alliance logic
    console.log('Ask for Alliance with', diplomacyContactOpponent?.playerProfile.name);
  };

  const handleDemandMoney = () => {
    // TODO: Implement demand money logic
    console.log('Demand Money from', diplomacyContactOpponent?.playerProfile.name);
  };

  const handleDemandTerritory = () => {
    // TODO: Implement demand territory logic
    console.log('Demand Territory from', diplomacyContactOpponent?.playerProfile.name);
  };

  const handleDemandSurrender = () => {
    // TODO: Implement demand surrender logic
    console.log('Demand Surrender from', diplomacyContactOpponent?.playerProfile.name);
  };

  // Calculate number of visible lands (owned by opponent)
  const visibleLandsCount = diplomacyContactOpponent?.landsOwned.size ?? 0;

  // Center the dialog on screen
  const dialogWidth = 760;
  const dialogHeight = 500;
  const x = (window.innerWidth - dialogWidth) / 2;
  const y = (window.innerHeight - dialogHeight) / 2;

  return (
    <Activity mode={showDiplomacyContactDialog ? 'visible' : 'hidden'}>
      <FantasyBorderFrame
        screenPosition={{ x, y }}
        frameSize={{ width: dialogWidth, height: dialogHeight }}
        secondaryButton={<GameButton buttonName={ButtonName.CANCEL} onClick={handleClose} />}
        zIndex={1010}
      >
        <div className={styles.container}>
          {/* Title */}
          <h2 className={styles.title}>Diplomatic Contact</h2>

          {/* Upper section: Opponent Information */}
          <div className={styles.opponentInfo}>
            <div className={styles.avatarSection}>
              <Avatar
                player={diplomacyContactOpponent?.playerProfile ?? NO_PLAYER}
                size={170}
                shape="rectangle"
                borderColor={diplomacyContactOpponent?.color}
                className={styles.avatar}
              />
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{diplomacyContactOpponent?.playerProfile.name}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Type:</span>
                <span className={styles.value}>{diplomacyContactOpponent?.playerProfile.type}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Alignment:</span>
                <span
                  className={styles.value}
                  style={{
                    color: getAlignmentColor(diplomacyContactOpponent?.playerProfile.alignment ?? NO_PLAYER.alignment),
                  }}
                >
                  {diplomacyContactOpponent?.playerProfile.alignment}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Race:</span>
                <span className={styles.value}>{diplomacyContactOpponent?.playerProfile.race}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Diplomacy:</span>
                <span className={`${styles.value} ${styles.diplomacyStatus}`}>{diplomacyStatus}</span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>Visible Lands:</span>
                <span className={styles.value}>{visibleLandsCount}</span>
              </div>
            </div>
          </div>

          {/* Bottom section: Diplomacy Actions */}
          <div className={styles.actionsSection}>
            <h3 className={styles.actionsTitle}>Diplomatic Actions</h3>

            <div className={styles.actionButtons}>
              <button
                className={styles.actionButton}
                onClick={handleDeclareWar}
                disabled={diplomacyStatus === DiplomacyStatus.WAR}
              >
                Declare War
              </button>

              <button
                className={styles.actionButton}
                onClick={handleAskForPeace}
                disabled={diplomacyStatus === DiplomacyStatus.PEACE}
              >
                Ask for Peace Treaty
              </button>

              <button
                className={styles.actionButton}
                onClick={handleAskForAlliance}
                disabled={diplomacyStatus === DiplomacyStatus.ALLIANCE}
              >
                Ask for Alliance
              </button>

              <button className={styles.actionButton} onClick={handleDemandMoney}>
                Demand Money per Turn
              </button>

              <button className={styles.actionButton} onClick={handleDemandTerritory}>
                Demand Territory
              </button>

              <button className={styles.actionButton} onClick={handleDemandSurrender}>
                Demand Surrender
              </button>
            </div>
          </div>
        </div>
      </FantasyBorderFrame>
    </Activity>
  );
};

export default DiplomacyContactDialog;
