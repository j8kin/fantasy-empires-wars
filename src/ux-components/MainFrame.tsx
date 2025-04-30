import styles from './Background.module.css';
import BorderCanvas from './BorderCanvas';

const MainFrame = () => {
  return (
    <div id="MainFrame" className={styles.backgroundStyle} style={{ flex: 1 }}>
      <BorderCanvas isTop={false} />
    </div>
  );
};

export default MainFrame;
