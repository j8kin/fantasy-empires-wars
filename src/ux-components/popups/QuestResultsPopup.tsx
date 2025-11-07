import React from 'react';
import PopupWrapper, { PopupProps } from './PopupWrapper';
import styles from './css/QuestResultsPopup.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';

const QuestResultsPopup: React.FC<PopupProps> = ({ screenPosition }) => {
  const { questResults, hideQuestResults } = useApplicationContext();

  if (!questResults || questResults.length === 0) {
    return null;
  }

  return (
    <PopupWrapper
      screenPosition={screenPosition}
      dimensions={{ width: 500, height: Math.max(200, 80 + questResults.length * 60) }}
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

export default QuestResultsPopup;
