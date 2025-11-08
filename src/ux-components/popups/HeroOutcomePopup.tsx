import React from 'react';
import PopupWrapper, { PopupProps } from './PopupWrapper';
import styles from './css/HeroOutcomePopup.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';

const getMessageHeight = (messages: string) => {
  // one text line contain ~ 65 characters and 30px height + 8px padding (see css)
  return (Math.floor(messages.length / 65) + 1) * 30 + 8;
};
const HeroOutcomePopup: React.FC<PopupProps> = ({ screenPosition }) => {
  const { questResults, hideQuestResults } = useApplicationContext();

  if (!questResults || questResults.length === 0) {
    return null;
  }
  const headerHeight = 80;
  const popupHeight = questResults.reduce((acc, msg) => acc + getMessageHeight(msg), 0);

  return (
    <PopupWrapper
      screenPosition={screenPosition}
      dimensions={{ width: 500, height: Math.max(150, headerHeight + popupHeight) }}
      accessible={true}
      onClose={hideQuestResults}
    >
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Quest Results</h3>
        </div>
        <div className={styles.results}>
          {questResults.map((result, index) => (
            <div key={index} className={styles.resultMessage}>
              {result}
            </div>
          ))}
        </div>
      </div>
    </PopupWrapper>
  );
};

export default HeroOutcomePopup;
