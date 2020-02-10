import React from "react";

import FlipSwitch from './Inputs/FlipSwitch/FlipSwitch';
import ModalTextBox from './Inputs/ModalTextBox/ModalTextBox';
import Select from './Inputs/Select/Select';

function typeSwitch (type, key, permission) {
    switch (type) {
        case 'flipSwitch': return <FlipSwitch key={key} type='storage'/>;
        case 'modalTextBox': return <ModalTextBox key={key}/>;
        case 'flipSwitchPermission': return <FlipSwitch key={key} type='permission' permission={permission}/>;
        case 'select': return <Select key={key}/>;
        default: return null;
    }
}

const row = (props) => {
    return (
        <tr>
            <td>{props.name}</td>
            <td>
                {typeSwitch(props.type, props.storageKey)}
            </td>
            <td>{props.description}</td>
        </tr>
    );
};

export default row;