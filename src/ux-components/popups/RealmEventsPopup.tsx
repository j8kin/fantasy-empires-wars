import React from 'react';
import styles from './css/HeroOutcomePopup.module.css';

import PopupWrapper from './PopupWrapper';

import { useApplicationContext } from '../../contexts/ApplicationContext';

import type { PopupProps } from './PopupWrapper';
import type { EmpireEventType } from '../../types/EmpireEvent';

const getMessageHeight = (messages: string) => {
  return (Math.floor(messages.length / 64) + 1) * 17 + 30.5;
};

const getEventBorderColor = (status: EmpireEventType): string => {
  switch (status) {
    case 'negative':
      return '#ff0000';
    case 'success':
      return '#2fd700';
    case 'neutral':
      return '#555555';
    case 'minor':
      return '#ffa500';
    case 'positive':
      return '#4169E1';
    case 'legendary':
      return '#6A0DAD';
  }
  return '#ffd700';
};

const RealmEventsPopup: React.FC<PopupProps> = ({ screenPosition }) => {
  const { heroOutcome, hideHeroOutcome } = useApplicationContext();

  if (!heroOutcome || heroOutcome.length === 0) {
    return null;
  }

  const headerHeight = 82;
  const popupHeight = heroOutcome.reduce(
    (acc, heroOutcome) => acc + getMessageHeight(heroOutcome.message),
    0
  );
  const heights = Math.max(150, headerHeight + Math.floor(popupHeight));

  return (
    <PopupWrapper
      screenPosition={screenPosition}
      dimensions={{ width: 500, height: heights > 498 ? 498 : heights }}
      accessible={true}
      onClose={hideHeroOutcome}
    >
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Echoes of the Realm</h3>
        </div>
        <div className={styles.results}>
          {heroOutcome.map((result, index) => (
            <div
              key={index}
              className={styles.resultMessage}
              style={{ borderLeftColor: getEventBorderColor(result.status) }}
            >
              {result.message}
            </div>
          ))}
        </div>
      </div>
    </PopupWrapper>
  );
};

export default RealmEventsPopup;
