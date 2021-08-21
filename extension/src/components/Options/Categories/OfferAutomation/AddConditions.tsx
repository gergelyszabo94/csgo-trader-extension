import { Condition, Operator } from '.';
import { conditions, operators } from 'utils/static/offers';

import AddCondition from 'components/Options/Categories/OfferAutomation/AddCondition';
import AddOperator from 'components/Options/Categories/OfferAutomation/AddOperator';
import CustomA11yButton from 'components/CustomA11yButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface AddConditionsProps {
    ruleConditions: Condition[];
    ruleOperators: Operator[];
    modifyConditions: (newConditions: Condition[], newOperators: Operator[]) => void;
}

const AddConditions = ({ ruleConditions, ruleOperators, modifyConditions }: AddConditionsProps) => {
    const onOperatorChange = (index: number, operator: Operator) => {
        const newOperators = [...ruleOperators];
        newOperators[index] = operator;
        modifyConditions(ruleConditions, newOperators);
    };

    const onConditionChange = (index: number, condition: Condition) => {
        const newCondition =
            condition.value === null
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
        newOperators.push(operators.and.key as Operator);
        modifyConditions(newConditions, newOperators);
    };

    return (
        <div>
            Conditions:
            {ruleConditions.map((condition, index) => {
                return (
                    <>
                        <AddCondition
                            key={`condition_${condition.type}`}
                            type={condition.type}
                            value={condition.value}
                            index={index}
                            onChange={onConditionChange}
                        />
                        {ruleOperators[index] !== undefined ? (
                            <AddOperator
                                index={index}
                                type={ruleOperators[index]}
                                onChange={onOperatorChange}
                                key={`operator_${ruleOperators[index]}`}
                            />
                        ) : null}
                    </>
                );
            })}
            <div>
                <CustomA11yButton
                    action={addNewCondition}
                    title='Add new condition'
                    className='mx-3'
                >
                    <FontAwesomeIcon icon={faPlus} />
                </CustomA11yButton>
            </div>
        </div>
    );
};

export default AddConditions;
