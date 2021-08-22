import React, { useState } from 'react';
import { actions, conditions } from 'utils/static/friendRequests';

import AddCondition from 'components/Options/Categories/Friends/AddCondition';
import CustomA11yButton from 'components/CustomA11yButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Rule } from '.';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Options = (): JSX.Element => {
    const optionsArr = [];
    for (const [key, value] of Object.entries(conditions)) {
        optionsArr.push({
            key,
            name: value.pretty,
            desc: value.description,
        });
    }
    return (
        <>
            {optionsArr.map((option) => {
                return (
                    <option key={option.key} value={option.key} title={option.desc}>
                        {option.name}
                    </option>
                );
            })}
        </>
    );
};

const Actions = (): JSX.Element => {
    const actionsArr = [];
    for (const [key, value] of Object.entries(actions)) {
        actionsArr.push({
            key,
            name: value.pretty,
            desc: value.description,
        });
    }

    return (
        <>
            {actionsArr.map((option) => {
                return (
                    <option key={option.key} value={option.key} title={option.desc}>
                        {option.name}
                    </option>
                );
            })}
        </>
    );
};

interface AddInviteRuleProps {
    add: (rule: Rule) => void;
}

const AddInviteRule = ({ add }: AddInviteRuleProps) => {
    const [rule, setRule] = useState({
        condition: conditions.profile_private.key,
        action: actions.ignore.key,
        value: null,
        valueType: null,
    });

    const onConditionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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
    };

    const onActionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRule({ ...rule, action: event.target.value });
    };

    const onValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRule({ ...rule, value: event.target.value });
    };

    const addRule = () => {
        const condition =
            rule.value === null
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
            <CustomA11yButton action={addRule} title='Add new rule' className='mx-3'>
                <FontAwesomeIcon icon={faPlus} />
            </CustomA11yButton>
            <select
                className='select-theme'
                onChange={onConditionChange}
                defaultValue={rule.condition}
            >
                <Options />
            </select>
            {rule.value !== null ? (
                <AddCondition
                    type={rule.valueType}
                    value={rule.value}
                    onValueChange={onValueChange}
                />
            ) : null}
            <select className='select-theme' onChange={onActionChange} defaultValue={rule.action}>
                <Actions />
            </select>
        </div>
    );
};

export default AddInviteRule;
