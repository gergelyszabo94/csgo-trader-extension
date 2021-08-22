import React, { useEffect, useState } from 'react';

import AddOfferRule from 'components/Options/Categories/OfferAutomation/AddOfferRule';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import { Link } from 'react-router-dom';
import OfferRule from 'components/Options/Categories/OfferAutomation/OfferRule';
import { Rule } from '.';

const OfferRules = () => {
    const [rules, setRules] = useState<Rule[]>([]);

    const saveRules = (newRules: Rule[]) => {
        chrome.storage.local.set(
            {
                offerEvalRules: newRules,
            },
            () => {
                setRules(newRules);
            },
        );
    };

    const removeRule = (ruleIndex: number) => {
        const newRules = rules.filter((rule, index) => {
            return index !== ruleIndex;
        });
        saveRules(newRules);
    };

    const changeOrder = (ruleIndex: number, change: number) => {
        const rule = rules[ruleIndex];
        const newRules = [...rules];
        newRules.splice(ruleIndex, 1);
        newRules.splice(ruleIndex + change, 0, rule);

        saveRules(newRules);
    };

    const saveRuleState = (ruleIndex: number, state: boolean) => {
        const newRules = rules.map((rule, index) => {
            if (index === ruleIndex) {
                return {
                    ...rule,
                    active: state,
                };
            }
            return rule;
        });
        saveRules(newRules);
    };

    const addNewRule = (rule: Rule) => {
        saveRules([...rules, rule]);
    };

    useEffect(() => {
        chrome.storage.local.get(['offerEvalRules'], ({ offerEvalRules }) => {
            setRules(offerEvalRules);
        });
    }, []);

    return (
        <div className='col-6'>
            <h5>Incoming Offer Rules</h5>
            <div className='mb-3 font-size--s'>
                <span>
                    You can set your own rules for incoming trade offers to be evaluated by. The rules are evaluated in
                    order, the first matching rule&apos;s action is applied. The feature only works if you are logged
                    into Steam in this browser. For the accept action to work the extension needs permission to
                    interactive with existing Steam tabs or open the offer for accepting. You can grant browser.tabs
                    permission by going to&nbsp;
                </span>
                <Link to='/options/general/'>General</Link>
                <ApiKeyIndicator />
                <span>&nbsp; Be careful when setting these rules and use it at your own risk.</span>
            </div>
            <table className='spacedTable'>
                <thead>
                    <tr>
                        <th title='Rule number/order'>Order</th>
                        <th title='Condition to match incoming invites'>Condition</th>
                        <th title='What action should the extension take when the invite matches the condition?'>
                            Action
                        </th>
                        <th title='Turn the individual rules on of off'>State</th>
                    </tr>
                </thead>
                <tbody>
                    {rules.map((rule, index) => {
                        const position = index === 0 ? 'top' : index === rules.length - 1 ? 'bottom' : 'middle';
                        return (
                            <OfferRule
                                key={JSON.stringify(rule)}
                                details={rule}
                                index={index}
                                saveRuleState={saveRuleState}
                                removeRule={removeRule}
                                changeOrder={changeOrder}
                                position={position}
                            />
                        );
                    })}
                </tbody>
            </table>
            <AddOfferRule add={addNewRule} />
        </div>
    );
};

export default OfferRules;
