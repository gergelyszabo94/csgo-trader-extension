import React from 'react';
import Condition from 'components/Options/Categories/Friends/Condition';
import Action from 'components/Options/Categories/Friends/Action';

const InviteRule = ({ details }) => {
  const { active, condition, action } = details;

  return (
    <div>
      <label className="switch">
        <input
          type="checkbox"
          checked={active}
        />
        <span className="slider round" />
      </label>
      <Condition type={condition.type} value={condition.value} />
      <Action action={action} />
    </div>
  );
};

export default InviteRule;
