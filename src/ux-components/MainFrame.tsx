import { ImageBackground } from 'react-native';
const MainFrame = () => {
  return (
    <div id="MainMap">
      <ImageBackground
        style={{
          height: 1000,
          width: 1000,
        }}
        source={require('../assets/images/CelticBackground.png')}
      />
    </div>
  );
};

export default MainFrame;
