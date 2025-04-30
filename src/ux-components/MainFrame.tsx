import { ImageBackground } from 'react-native';

import styles from './Background.module.css';

const MainFrame = () => {
  return (
    <div id="MainFrame" className={styles.backgroundStyle} style={{ width: '100%' }}>
      <ImageBackground
        style={{
          height: 100,
          width: 100,
        }}
        source={require('../assets/images/CelticBackground.png')}
      />
    </div>
  );
};

export default MainFrame;
