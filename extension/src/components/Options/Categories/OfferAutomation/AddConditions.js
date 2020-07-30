import React from 'react';
import AddCondition from 'components/Options/Categories/OfferAutomation/AddCondition';
import AddOperator from 'components/Options/Categories/OfferAutomation/AddOperator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import { conditions, operators } from 'utils/static/offers';

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

  const addNewCondition = () => {
    const newConditions = [...ruleConditions];
    newConditions.push({
      type: conditions.has_message.key,
    });

    const newOperators = [...ruleOperators];
    newOperators.push(operators.and.key);
    modifyConditions(newConditions, newOperators);
  };

  return (
    <div>
      Conditions:
      {
        ruleConditions.map((condition, index) => {
          return (
            <>
              <AddCondition
                key={`condition_${condition.type}`}
                type={condition.type}
                value={condition.value}
                index={index}
                onChange={onConditionChange}
              />
              {
                ruleOperators[index] !== undefined
                  ? (
                    <AddOperator
                      index={index}
                      type={ruleOperators[index]}
                      onChange={onOperatorChange}
                      key={`operator_${ruleOperators[index]}`}
                    />
                  )
                  : null
              }
            </>
          );
        })
      }
      <div>
        <CustomA11yButton action={addNewCondition} title="Add new condition" className="mx-3">
          <FontAwesomeIcon icon={faPlus} />
        </CustomA11yButton>
      </div>
    </div>
  );
};

export default AddConditions;
