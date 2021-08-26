import React from 'react';

import { Rule } from '.';

import CustomA11yButton from 'components/CustomA11yButton';
import Action from 'components/Options/Categories/OfferAutomation/Action';
import Conditions from 'components/Options/Categories/OfferAutomation/Conditions';

import { faChevronDown, faChevronUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface OfferRuleProps {
    details: Rule;
    index: number;
    saveRuleState: (ruleIndex: number, state: boolean) => void;
    removeRule: (ruleIndex: number) => void;
    changeOrder: (ruleIndex: number, state: number) => void;
    position: 'top' | 'bottom' | 'middle';
}

const OfferRule = ({ details, index, saveRuleState, removeRule, changeOrder, position }: OfferRuleProps) => {
    const { active, conditions, action, operators } = details;

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
                <Conditions conditions={conditions} operators={operators} />
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

export default OfferRule;
