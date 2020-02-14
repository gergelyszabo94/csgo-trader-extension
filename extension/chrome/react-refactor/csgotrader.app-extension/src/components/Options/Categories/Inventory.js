import React, { Fragment } from 'react';
import Row from 'components/Options/Row';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import Category from '../Category/Category';

const inventory = () => {
    return (
        <Category title='Inventory'>
            <Row
                name='Default sorting mode'
                id='inventorySortingMethod'
                type='select'
                description='Specifies what method the items in an inventory should be sorted by'
            />
            <Row
                name='Get float values automatically'
                id='autoFloatInventory'
                type='flipSwitchStorage'
                description='Loads float values to each item when on'
            />
            <Row
                name='Show partner history'
                id='tradeHistoryInventory'
                type='flipSwitchStorage'
                description={
                    <Fragment>
                        Show the number of offers received from a user and how many was sent to them <FontAwesomeIcon icon={faCode} className='apiIcon' />
                    </Fragment>
                }
            />
        </Category>
    );
};

export default inventory;
