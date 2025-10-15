import React from 'react';
import PopupWrapper, { PopupProps } from './PopupWrapper';
import styles from './css/Popup.module.css';
import { useApplicationContext } from '../../contexts/ApplicationContext';

const ErrorMessagePopup: React.FC<PopupProps> = ({ screenPosition }) => {
  const { errorMessagePopupMessage } = useApplicationContext();
  return (
    <PopupWrapper
      screenPosition={screenPosition}
      dimensions={{ width: 400, height: 100 }}
      accessible={true}
    >
      <div className={styles.popupContent} style={{ height: '60px', justifyContent: 'center' }}>
        <div className={styles.message}>{errorMessagePopupMessage}</div>
      </div>
    </PopupWrapper>
  );
};

export default ErrorMessagePopup;
