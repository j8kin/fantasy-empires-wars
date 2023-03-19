import { Dimensions } from 'react-native';
import type { ManaProp } from "../types/Mana";

const Radius = 100;
const tableWidth = (Dimensions.get('window').width/5).toFixed(0);

const ManaVial = (prop: ManaProp) => {
    return(
        <>
            <td width={tableWidth} align='center'>
                <img 
                style={{
                    height: Radius,
                    width: Radius,
                    opacity: 0.8,
                    backgroundColor: prop.color,
                    borderRadius: Radius,
                    borderColor: prop.color,
                }}
                src={require('../maps/glass-ball22.png')}
                alt={prop.color + " color Mana Vial filled by: " + Number(prop.mana)/5 + "%"} />
            </td>
        </>
    )
}

export default ManaVial;