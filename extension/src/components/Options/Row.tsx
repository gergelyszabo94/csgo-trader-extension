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

interface TypeSwitchProps {
    type: string;
    id: string | string[];
    key?: string;
    permission?: string;
    origins?: string[];
    modalTitle?: string;
    options?: Option[] | object;
}

const TypeSwitch = ({ type, key, permission, origins, modalTitle, options }: TypeSwitchProps) => {
    switch (type) {
        case 'flipSwitchStorage':
            return <FlipSwitchStorage id={key} />;
        case 'modalTextBox':
            return <ModalTextBox id={key} modalTitle={modalTitle} />;
        case 'modalCustomComments':
            return <ModalCustomComments modalTitle={modalTitle} />;
        case 'flipSwitchPermission':
            return <FlipSwitchPermission id={key} permission={permission} origins={origins} />;
        case 'select':
            return <SimpleSelect id={key} options={options as Option[]} />;
        case 'pricingProvider':
            return <PricingProvider options={options as object} />;
        case 'refresh':
            return <Refresh />;
        case 'linksToShow':
            return <LinksToShow id={key} />;
        case 'backup':
            return <Backup id={key} />;
        case 'restore':
            return <Restore />;
        case 'doubleSelect':
            return <DoubleSelect id={[...key]} options={options as Option[]} />;
        case 'currency':
            return <Currency id={key} options={options as Option[]} />;
        case 'number':
            return <Number id={key} />;
        case 'realtimepricingmode':
            return <RealTimePricingMode id={key} options={options as Option[]} />;
        case 'volumeSlider':
            return <VolumeSlider id={key} />;
        case 'notifSound':
            return <NotificationSound />;
        default:
            return null;
    }
};

export interface Option {
    key: string;
    text: string;
    description?: string;
}

interface RowProps {
    name: string;
    description: string | JSX.Element;
    type: string;
    id: string | string[];
    permission?: string;
    origins?: string[];
    modalTitle?: string;
    options?: Option[] | object;
}

const row = ({ name, description, type, id, permission, origins, modalTitle, options }: RowProps) => {
    return (
        <div className='row mb-4 pb-4 option-row'>
            <div className='col-md-12'>
                <h5>{name}</h5>
            </div>
            <div className='col-md-6'>
                <p className='font-size--s'>{description}</p>
            </div>
            <div className='col-md-6'>
                <TypeSwitch
                    type={type}
                    id={id}
                    permission={permission}
                    origins={origins}
                    modalTitle={modalTitle}
                    options={options}
                />
            </div>
        </div>
    );
};

export default row;
