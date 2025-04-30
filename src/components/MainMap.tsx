import {ImageBackground} from 'react-native';
const MainMap = () => {
    return(
        <div id="MainMap">
            <ImageBackground
                style={{
                  height: 1000,
                  width: 1000,
                }}
                source={require('../maps/fantasy-map.jpg')}
            />
        </div>
    )
}

export default MainMap;