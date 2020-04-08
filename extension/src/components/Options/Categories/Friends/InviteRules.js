import React, { useState, useEffect } from 'react';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import InviteRule from './InviteRule';

const InviteRules = () => {
  const [rules, setRules] = useState([]);

  const saveRules = (newRules) => {
    chrome.storage.local.set({
      friendRequestEvalRules: newRules,
    }, () => {
      setRules(newRules);
    });
  };

  const removeRule = (ruleIndex) => {
    const newRules = rules.filter((rule, index) => {
      return index !== ruleIndex;
    });
    chrome.storage.local.set({
      friendRequestEvalRules: newRules,
    }, () => {
      setRules(newRules);
    });
  };

  const changeOrder = (ruleIndex, change) => {
    const rule = rules[ruleIndex];
    const newRules = [...rules];
    newRules.splice(ruleIndex, 1);
    newRules.splice(ruleIndex + change, 0, rule);

    chrome.storage.local.set({
      friendRequestEvalRules: newRules,
    }, () => {
      setRules(newRules);
    });
  };

  const saveRuleState = (ruleIndex, state) => {
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

  useEffect(() => {
    chrome.storage.local.get(['friendRequestEvalRules'], ({ friendRequestEvalRules }) => {
      setRules(friendRequestEvalRules);
    });
  }, []);

  return (
    <div className="col-6">
      <h5>Invite Rules</h5>
      <div className="mb-3 font-size--s">
        <span>
          You can set your own rules for incoming friend requests to be evaluated by.
          The rules are evaluated in order, the first matching rule&apos;s action is applied.
          The feature only works if you are logged into Steam in this browser.
          It&apos;s useful for example to automatically ignore scammers.
        </span>
        <ApiKeyIndicator />
      </div>
      <table className="inviteRules">
        <thead>
          <tr>
            <th title="Rule number/order">Order</th>
            <th title="Condition to match incoming invites">Condition</th>
            <th title="What action should the extension take when the invite matches the condition?">Action</th>
            <th title="Turn the individual rules on of off">State</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, index) => {
            const position = index === 0
              ? 'top'
              : index === (rules.length - 1)
                ? 'bottom'
                : 'middle';
            return (
              <InviteRule
                key={rule.condition.type + rule.condition.value + rule.action + rule.active}
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
    </div>
  );
};

export default InviteRules;
