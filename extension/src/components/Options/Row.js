import React from 'react';

import Currency from 'components/Options/Inputs/Currency/Currency';
import FlipSwitchStorage from './Inputs/FlipSwitchStorage/FlipSwitchStorage';
import FlipSwitchPermission from './Inputs/FlipSwitchPermission/FlipSwitchPermission';
import ModalTextBox from './Inputs/ModalTextBox/ModalTextBox';
import ModalCustomComments from './Inputs/ModalCustomComments/ModalCustomComments';
import SimpleSelect from './Inputs/SimpleSelect/SimpleSelect';
import DoubleSelect from './Inputs/DoubleSelect/DoubleSelect';
import PricingProvider from './Inputs/PricingProvider/PricingProvider';
import Refresh from './Inputs/Refresh/Refresh';
import LinksToShow from './Inputs/LinksToShow/LinksToShow';
import Backup from './Inputs/Backup/Backup';
import Restore from './Inputs/Restore/Restore';
import Number from './Inputs/Number/Number';
import RealTimePricingMode from './Inputs/RealTimePricingMode/RealTimePricingMode';
import VolumeSlider from './Inputs/VolumeSlider/VolumeSlider';
import NotificationSound from './Inputs/NotificationSound/NotificationSound';
import ArrayOfStrings from './Inputs/ArrayOfStrings/ArrayOfStrings';

import './Row.css';

const typeSwitch = (type, key, permission, origins, modalTitle, options) => {
  switch (type) {
    case 'flipSwitchStorage':
      return <FlipSwitchStorage id={key} />;
    case 'modalTextBox':
      return <ModalTextBox id={key} modalTitle={modalTitle} />;
    case 'modalCustomComments':
      return <ModalCustomComments id={key} modalTitle={modalTitle} />;
    case 'flipSwitchPermission':
      return (
        <FlipSwitchPermission
          id={key}
          permission={permission}
          origins={origins}
        />
      );
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
    case 'arrayOfStrings':
      return <ArrayOfStrings id={key} />;
    default:
      return null;
  }
};

const row = ({
  name, description, type, id, permission, origins, modalTitle, options,
}) => {
  return (
    <div className="row mb-4 pb-4 option-row">
      <div className="col-md-12">
        <h5>{name}</h5>
      </div>
      <div className="col-md-6">
        <p className="font-size--s">{description}</p>
      </div>
      <div className="col-md-6">
        {typeSwitch(type, id, permission, origins, modalTitle, options)}
      </div>
    </div>
  );
};

export default row;
