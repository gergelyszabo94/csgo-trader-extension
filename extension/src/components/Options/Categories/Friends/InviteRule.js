import React from 'react';
import Condition from 'components/Options/Categories/Friends/Condition';
import Action from 'components/Options/Categories/Friends/Action';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';

const InviteRule = ({
  details, index, saveRuleState, removeRule,
}) => {
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
            onChange={() => { saveRuleState(index, !active); }}
          />
          <span className="slider round" />
        </label>
      </td>
      <td>
        <CustomA11yButton action={() => { removeRule(index); }} title="Remove rule">
          <FontAwesomeIcon icon={faTrash} className="removeRule" />
        </CustomA11yButton>
      </td>
    </tr>
  );
};

export default InviteRule;
