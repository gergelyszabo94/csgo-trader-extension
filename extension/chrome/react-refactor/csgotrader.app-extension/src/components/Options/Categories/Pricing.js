import React, { Fragment } from "react";

import Category from '../Category/Category';
import Row from '../Row';

const pricing = props => {
    return (
        <Category
            title='Pricing'
            subTitle={
                <Fragment>
                    <span className="countdown">DISCLAIMER:</span> No pricing provider is 100% accurate all the time.
                    Take these prices as advisory, always with a pinch of salt. You should not rely on them solely when doing your trades.
                </Fragment>}>
            <Row
                name='Pricing'
                type='flipSwitchStorage'
                id='itemPricing'
                description='Shows item prices in inventories and trade offers'
            />
            <Row
                name='Currency'
                type='select'
                id='Provider'
                description={
                    <Fragment>
                        The pricing provider you want to get your prices from <br/><p><b>About the provider: </b></p>
                    </Fragment>
                }
            />
        </Category>
    );
};

export default pricing;
