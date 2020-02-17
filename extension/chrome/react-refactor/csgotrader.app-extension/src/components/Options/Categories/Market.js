import React from "react";

import Category from "../Category/Category";
import Row from 'components/Options/Row';

const market = () => {
    return (
        <Category title="Market">
            <Row
                name='Listings per page'
                id='numberOfListings'
                type='select'
                description='The number of market listings you want to see when you load the market page of an item'
                options={
                    [
                        {
                            key: 10,
                            text: 10
                        },
                        {
                            key: 20,
                            text: 20
                        },
                        {
                            key: 50,
                            text: 50
                        },
                        {
                            key: 100,
                            text: 100
                        }
                    ]
                }
            />
            <Row
                name='Get float values automatically'
                id='autoFloatMarket'
                type='flipSwitchStorage'
                description='Loads float values to each item when on'
            />
            <Row
                name='Original price'
                id='marketOriginalPrice'
                type='flipSwitchStorage'
                description={'Show the price of listings in the seller\'s currency too as well as what they will receive after fees.'}
            />
        </Category>
    );
};

export default market;
