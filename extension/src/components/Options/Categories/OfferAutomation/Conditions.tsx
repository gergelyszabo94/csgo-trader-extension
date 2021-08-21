import { Condition as ConditionType, Operator as OperatorType } from '.';

import Condition from './Condition';
import Operator from './Operator';
// import Condition from 'components/Options/Categories/OfferAutomation/Condition';
// import Operator from 'components/Options/Categories/OfferAutomation/Operator';
import React from 'react';

interface ConditionsProps {
    conditions: ConditionType[];
    operators: OperatorType[];
}

const Conditions = ({ conditions, operators }: ConditionsProps): JSX.Element => {
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
