import React from 'react';
import AddCondition from 'components/Options/Categories/OfferAutomation/AddCondition';
import AddOperator from 'components/Options/Categories/OfferAutomation/AddOperator';

const AddConditions = ({ ruleConditions, ruleOperators, modifyConditions }) => {
  const onOperatorChange = ((index, operator) => {
    const newOperators = [...ruleOperators];
    newOperators[index] = operator;
    modifyConditions(ruleConditions, newOperators);
  });

  const onConditionChange = (index, condition) => {
    const newCondition = condition.value === null
      ? { type: condition.type }
      : { type: condition.type, value: condition.value };
    const newConditions = [...ruleConditions];
    newConditions[index] = newCondition;
    modifyConditions(newConditions, ruleOperators);
  };

  return (
    <div>
      Conditions:
      {
        ruleConditions.map((condition, index) => {
          return (
            <AddCondition
              key={condition.type}
              type={condition.type}
              value={condition.value}
              index={index}
              onChange={onConditionChange}
            />
          );
        })
      }
      {
        ruleOperators.map((operator, index) => {
          return (
            <AddOperator index={index} type={operator} onChange={onOperatorChange} />
          );
        })
      }
    </div>
  );
};

export default AddConditions;
