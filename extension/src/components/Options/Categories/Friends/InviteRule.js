import React from 'react';
import Condition from 'components/Options/Categories/Friends/Condition';
import Action from 'components/Options/Categories/Friends/Action';

const InviteRule = ({ details, index }) => {
  const { active, condition, action } = details;

  return (
    <tr>
      <td>
        {index + 1}
      </td>
      <td>
        <Condition type={condition.type} value={condition.value} />
      </td>
      <td>
        <Action action={action} />
      </td>
      <td>
        <label className="switch">
          <input
            type="checkbox"
            checked={active}
          />
          <span className="slider round" />
        </label>
      </td>
    </tr>
  );
};

export default InviteRule;
