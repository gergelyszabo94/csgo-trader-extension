import React, { useState } from 'react';
import { conditions, actions } from 'utils/static/offers';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddConditions from 'components/Options/Categories/OfferAutomation/AddConditions';
import Modal from 'components/Modal/Modal';

const Actions = () => {
  const actionsArr = [];
  for (const [key, value] of Object.entries(actions)) {
    actionsArr.push({
      key,
      name: value.pretty,
      desc: value.description,
    });
  }
  return (
    actionsArr.map((option) => {
      return <option key={option.key} value={option.key} title={option.desc}>{option.name}</option>;
    })
  );
};

const AddOfferRule = ({ add }) => {
  const [rule, setRule] = useState({
    conditions: [{
      type: conditions.has_message.key,
      value: null,
      valueType: null,
    }],
    action: actions.notify.key,
    operators: [],
    value: null,
    valueType: null,
  });

  const onActionChange = ((event) => {
    setRule({ ...rule, action: event.target.value });
  });

  const onConditionsChange = ((newConditions, newOperators) => {
    setRule({ ...rule, conditions: newConditions, operators: newOperators });
  });

  const addRule = (closeModal) => {
    add({
      active: true,
      action: rule.action,
      conditions: rule.conditions,
      operators: rule.operators,
    });
    closeModal();
  };

  return (
    <div>
      <Modal modalTitle="Add a new Trade Offer rule" opener={<FontAwesomeIcon icon={faPlus} />} validator={addRule}>
        <AddConditions
          ruleConditions={rule.conditions}
          ruleOperators={rule.operators}
          modifyConditions={onConditionsChange}
        />
        <div>
          Action:
          <select className="select-theme" onChange={onActionChange} defaultValue={rule.action}>
            <Actions />
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default AddOfferRule;
