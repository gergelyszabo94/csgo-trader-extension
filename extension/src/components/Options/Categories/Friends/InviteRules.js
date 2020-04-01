import React, { useState, useEffect } from 'react';
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
      <h3>Invite Rules</h3>
      {rules.map((rule) => {
        return (
          <InviteRule
            key={rule.condition.type + rule.condition.value + rule.action + rule.active}
            details={rule}
          />
        );
      })}
    </div>
  );
};

export default InviteRules;
