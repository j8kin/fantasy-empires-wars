import Table from 'react-bootstrap/Table';
import ManaVial from "./ManaVial"

const ManaPanel = () => {
    return(
        <>
            <Table>
                <tr>
            <ManaVial color="black" mana="400" />
            <ManaVial color="white" mana="200" />
            <ManaVial color="blue" mana="100" />
            <ManaVial color="green" mana="0" />
            <ManaVial color="red" mana="10" />

                </tr>
            </Table>
        </>
    )
}

export default ManaPanel;