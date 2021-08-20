import React from 'react';
import Condition from 'components/Options/Categories/OfferAutomation/Condition';
import Operator from 'components/Options/Categories/OfferAutomation/Operator';

const Conditions = ({ conditions, operators }) => {
  return (
    <>
      {conditions.map((condition, index) => {
        return (
          <span key={condition.type}>
            <Condition type={condition.type} value={condition.value} />
            &nbsp;
            <Operator operator={operators[index]} />
            &nbsp;
          </span>
        );
      })}
    </>
  );
};

export default Conditions;
