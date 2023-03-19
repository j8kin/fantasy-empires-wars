import {ImageBackground} from 'react-native';
const MainMap = () => {
    return(
        <ImageBackground
            style={{
              height: 1000,
              width: 1000,
            }}
            source={require('../maps/fantasy-map.jpg')}
        />
    )
}

export default MainMap;