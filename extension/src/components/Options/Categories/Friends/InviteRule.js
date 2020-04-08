import React from 'react';
import Condition from 'components/Options/Categories/Friends/Condition';
import Action from 'components/Options/Categories/Friends/Action';
import { faTrash, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';

const InviteRule = ({
  details, index, saveRuleState, removeRule, position, changeOrder,
}) => {
  const { active, condition, action } = details;
  const moveRuleUp = (
    <CustomA11yButton action={() => { changeOrder(index, -1); }} title="Move rule up">
      <FontAwesomeIcon icon={faChevronUp} />
    </CustomA11yButton>
  );

  const moveRuleDown = (
    <CustomA11yButton action={() => { changeOrder(index, 1); }} title="Move rule down">
      <FontAwesomeIcon icon={faChevronDown} />
    </CustomA11yButton>
  );

  return (
    <tr>
      <td>
        {index + 1}
        .&nbsp;
        {
          position === 'top'
            ? moveRuleDown
            : position === 'bottom'
              ? moveRuleUp
              : (
                <>
                  {moveRuleUp}
                  {moveRuleDown}
                </>
              )
        }
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
