import React, { useState } from 'react';

import { actions, conditions } from 'utils/static/offers';

import { Condition, Operator, Rule } from '.';

import Modal from 'components/Modal';
import AddConditions from 'components/Options/Categories/OfferAutomation/AddConditions';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Actions = (): JSX.Element => {
    return (
        <>
            {Object.keys(actions).map((key) => {
                const action = actions[key];
                return (
                    <option key={key} value={key} title={action.description}>
                        {action.pretty}
                    </option>
                );
            })}
        </>
    );
};

const initState: Rule = {
    conditions: [
        {
            type: conditions.has_message.key,
            value: null,
            valueType: null,
        },
    ],
    active: false,
    action: actions.notify.key,
    operators: [],
    value: null,
    valueType: null,
};

interface AddOfferRuleProps {
    add: (rule: Rule) => void;
}

const AddOfferRule = ({ add }: AddOfferRuleProps) => {
    const [rule, setRule] = useState<Rule>(initState);

    const onActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRule({ ...rule, action: event.target.value });
    };

    const onConditionsChange = (newConditions: Condition[], newOperators: Operator[]) => {
        setRule({ ...rule, conditions: newConditions, operators: newOperators });
    };

    const addRule = (closeModal: () => void) => {
        add({
            active: true,
            action: rule.action,
            conditions: rule.conditions,
            operators: rule.operators,
        });
        closeModal();
        setRule(initState);
    };

    return (
        <div>
            <Modal
                modalTitle='Add a new Trade Offer rule'
                opener={<FontAwesomeIcon icon={faPlus} />}
                validator={addRule}
            >
                <AddConditions
                    ruleConditions={rule.conditions}
                    ruleOperators={rule.operators}
                    modifyConditions={onConditionsChange}
                />
                <div>
                    Action:
                    <select className='select-theme' onChange={onActionChange} defaultValue={rule.action}>
                        <Actions />
                    </select>
                </div>
            </Modal>
        </div>
    );
};

export default AddOfferRule;
