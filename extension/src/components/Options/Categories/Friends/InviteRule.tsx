import React from 'react';

import { Rule } from '.';

import CustomA11yButton from 'components/CustomA11yButton';
import Action from 'components/Options/Categories/Friends/Action';
import Condition from 'components/Options/Categories/Friends/Condition';

import { faChevronDown, faChevronUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface InviteRuleProps {
    details: Rule;
    index: number;
    saveRuleState: (ruleIndex: number, state: boolean) => void;
    removeRule: (ruleIndex: number) => void;
    changeOrder: (ruleIndex: number, change: number) => void;
    position: 'top' | 'bottom' | 'middle';
}

const InviteRule = ({ details, index, saveRuleState, removeRule, position, changeOrder }: InviteRuleProps) => {
    const { active, condition, action } = details;
    const moveRuleUp = (
        <CustomA11yButton
            action={() => {
                changeOrder(index, -1);
            }}
            title='Move rule up'
        >
            <FontAwesomeIcon icon={faChevronUp} />
        </CustomA11yButton>
    );

    const moveRuleDown = (
        <CustomA11yButton
            action={() => {
                changeOrder(index, 1);
            }}
            title='Move rule down'
        >
            <FontAwesomeIcon icon={faChevronDown} />
        </CustomA11yButton>
    );

    return (
        <tr>
            <td>
                {index + 1}
                .&nbsp;
                {position === 'top' ? (
                    moveRuleDown
                ) : position === 'bottom' ? (
                    moveRuleUp
                ) : (
                    <>
                        {moveRuleUp}
                        {moveRuleDown}
                    </>
                )}
            </td>
            <td>
                <Condition type={condition.type} value={condition.value} />
            </td>
            <td>
                <Action action={action} />
            </td>
            <td>
                <label className='switch' title='Switch the rule on or off'>
                    <input
                        type='checkbox'
                        checked={active}
                        onChange={() => {
                            saveRuleState(index, !active);
                        }}
                    />
                    <span className='slider round' />
                </label>
            </td>
            <td>
                <CustomA11yButton
                    action={() => {
                        removeRule(index);
                    }}
                    title='Remove rule'
                >
                    <FontAwesomeIcon icon={faTrash} className='removeRule' />
                </CustomA11yButton>
            </td>
        </tr>
    );
};

export default InviteRule;
