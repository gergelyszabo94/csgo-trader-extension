import React, { useState } from 'react';
import { conditions, actions } from 'utils/static/friendRequests';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import AddCondition from 'components/Options/Categories/Friends/AddCondition';

const Options = () => {
  const optionsArr = [];
  for (const [key, value] of Object.entries(conditions)) {
    optionsArr.push({
      key,
      name: value.pretty,
      desc: value.description,
    });
  }
  return (
    optionsArr.map((option) => {
      return <option key={option.key} value={option.key} title={option.desc}>{option.name}</option>;
    })
  );
};

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

const AddInviteRule = ({ add }) => {
  const [rule, setRule] = useState({
    condition: conditions.profile_private.key,
    action: actions.ignore.key,
    value: null,
    valueType: null,
  });

  const onConditionChange = ((event) => {
    const conditionType = event.target.value;
    setRule({
      ...rule,
      condition: conditionType,
      value: conditions[conditionType].with_value
        ? conditions[conditionType].default_value
        : null,
      valueType: conditions[conditionType].with_value
        ? conditions[conditionType].value_type
        : null,
    });
  });

  const onActionChange = ((event) => {
    setRule({ ...rule, action: event.target.value });
  });

  const onValueChange = ((event) => {
    setRule({ ...rule, value: event.target.value });
  });

  const addRule = () => {
    const condition = rule.value === null
      ? { type: rule.condition }
      : { type: rule.condition, value: rule.value };

    add({
      active: true,
      action: rule.action,
      condition,
    });
  };

  return (
    <div>
      <CustomA11yButton action={addRule} title="Add new rule" className="mx-3">
        <FontAwesomeIcon icon={faPlus} />
      </CustomA11yButton>
      <select className="select-theme" onChange={onConditionChange} defaultValue={rule.condition}>
        <Options />
      </select>
      {
        rule.value !== null
          ? <AddCondition type={rule.valueType} value={rule.value} onValueChange={onValueChange} />
          : null
      }
      <select className="select-theme" onChange={onActionChange} defaultValue={rule.action}>
        <Actions />
      </select>
    </div>
  );
};

export default AddInviteRule;
