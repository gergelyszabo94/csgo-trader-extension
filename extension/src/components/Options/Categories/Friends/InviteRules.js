import React, { useState, useEffect } from 'react';
import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import InviteRule from './InviteRule';

const InviteRules = () => {
  const [rules, setRules] = useState([]);

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
        It&apos;s useful for example to automatically ignore scammers.
        </span>
        <ApiKeyIndicator />
      </div>
      <table className="inviteRules">
        <thead>
          <tr>
            <th>Number</th>
            <th>Condition</th>
            <th>Action</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, index) => {
            return (
              <InviteRule
                key={rule.condition.type + rule.condition.value + rule.action + rule.active}
                details={rule}
                index={index}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InviteRules;
