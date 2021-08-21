import './Row.css';

import Backup from './Inputs/Backup';
import Currency from 'components/Options/Inputs/Currency';
import DoubleSelect from './Inputs/DoubleSelect';
import FlipSwitchPermission from './Inputs/FlipSwitchPermission';
import FlipSwitchStorage from './Inputs/FlipSwitchStorage';
import LinksToShow from './Inputs/LinksToShow';
import ModalCustomComments from './Inputs/ModalCustomComments';
import ModalTextBox from './Inputs/ModalTextBox';
import NotificationSound from './Inputs/NotificationSound';
import Number from './Inputs/Number';
import PricingProvider from './Inputs/PricingProvider';
import React from 'react';
import RealTimePricingMode from './Inputs/RealTimePricingMode';
import Refresh from './Inputs/Refresh';
import Restore from './Inputs/Restore';
import SimpleSelect from './Inputs/SimpleSelect';
import VolumeSlider from './Inputs/VolumeSlider';

const typeSwitch = (type, key, permission, origins, modalTitle, options) => {
    switch (type) {
        case 'flipSwitchStorage':
            return <FlipSwitchStorage id={key} />;
        case 'modalTextBox':
            return <ModalTextBox id={key} modalTitle={modalTitle} />;
        case 'modalCustomComments':
            return <ModalCustomComments id={key} modalTitle={modalTitle} />;
        case 'flipSwitchPermission':
            return <FlipSwitchPermission id={key} permission={permission} origins={origins} />;
        case 'select':
            return <SimpleSelect id={key} options={options} />;
        case 'pricingProvider':
            return <PricingProvider options={options} />;
        case 'refresh':
            return <Refresh id={key} />;
        case 'linksToShow':
            return <LinksToShow id={key} />;
        case 'backup':
            return <Backup id={key} />;
        case 'restore':
            return <Restore id={key} />;
        case 'doubleSelect':
            return <DoubleSelect id={[...key]} options={options} />;
        case 'currency':
            return <Currency id={key} options={options} />;
        case 'number':
            return <Number id={key} />;
        case 'realtimepricingmode':
            return <RealTimePricingMode id={key} options={options} />;
        case 'volumeSlider':
            return <VolumeSlider id={key} />;
        case 'notifSound':
            return <NotificationSound />;
        default:
            return null;
    }
};

const row = ({ name, description, type, id, permission, origins, modalTitle, options }) => {
    return (
        <div className='row mb-4 pb-4 option-row'>
            <div className='col-md-12'>
                <h5>{name}</h5>
            </div>
            <div className='col-md-6'>
                <p className='font-size--s'>{description}</p>
            </div>
            <div className='col-md-6'>
                {typeSwitch(type, id, permission, origins, modalTitle, options)}
            </div>
        </div>
    );
};

export default row;