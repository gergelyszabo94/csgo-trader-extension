import React, {Fragment} from "react";
import { Container } from 'react-bootstrap';

import Head from '../../components/Head/Head';
import NewTabLink from '../../components/NewTabLink/NewTabLink';

const prices = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
        <Fragment>
            <Head
                description="CSGO Trader - Describes how the extension calculates prices and where they are available"
                title="CSGO Trader - Prices"
                path={window.location.pathname}
            />

            <h1>Prices</h1>
            <Container className='buildingBlock'>
                <h2>How prices are calculated</h2>
                CSGOTrader mostly relies on Steam Community Market historical sales data to calculate it's prices.
                If there is no market data it uses other providers, the whole algorithm is described in plain english
                below.
                If you prefer to read the Python code itself you can scroll through this.
                For popular items with stable market sales it's pretty simple.
                <br/>
                <ul>
                    <li>
                        <span className="orange">A,</span> If there is more than 5 sold in the past 24 hours and the
                        average price does not differ more than 10% from the past week's average this is what the
                        extension takes as the price of the item.
                        This is the case for most popular items.
                    </li>
                    <li>
                        <span className="orange">B,</span> If that is not the case the extension takes the last
                        week's average and adjusts it with the general market trend of the last week.
                    </li>
                </ul>
                If the item is not that popular (in this case defined as sold less than 5 times in the past 24
                hours) then the next best thing that can be checked is the average of the last week.
                <br/>
                <ul>
                    <li>
                        <span className="orange">C,</span> If there were more than 5 sales during the last week
                        and the difference between that and the last month's average is less than 10%
                        this average is taken and used as the price after it gets adjusted by general market
                        trends.
                    </li>
                    <li>
                        <span className="orange">D,</span> When there is less than 5 sold in the past week or
                        there is no weekly data at all the monthly average is taken after adjusted with market
                        trends.
                    </li>
                    <li>
                        <span className="orange">E,</span> If the item is StatTrak then the prices are compared to the non-st one.
                        If the price of the StatTrak one is lower then the non-st one's price is taken and an additional 10% is added.
                        This case should be pretty rare.
                    </li>
                </ul>
                If there is no market sales data the algorithm proceeds to other providers
                <br/>
                <ul>
                    <li>
                        <span className="orange">F,</span> If there is pricing info on CS.MONEY it takes
                        that price and adjusts with the average difference between CS.MONEY and market
                        prices.
                    </li>
                    <li>
                        <span className="orange">G,</span> If there is no CS.MONEY price it tries taking the
                        Buff price and adjusts with the average difference between Buff and market
                        prices.
                    </li>
                    <li>
                        <span className="orange">H,</span> If there is no Buff price it takes a price
                        from a database table where prices are set manually.
                        This is pretty much unused for now. I have built this functionality so I can add
                        prices for new items when there is no data from the providers yet.
                    </li>
                    <li>
                        <span className="orange">I,</span> If all of the above doesn't happen then the
                        extension does not set any price to the item.
                    </li>
                </ul>
                Special cases:
                <br/>
                <ul>
                    <li>
                        <span className="orange">J,</span> Doppler and Gamma doppler knives have special
                        pricing,
                        if there is price info for the given phase for the knife on CS.MONEY, it takes
                        that price and adjusts with the average difference between CS.MONEY and market
                        prices.
                        If there isn't it falls back to the price calculated by the algorithm above.
                    </li>
                </ul>
                <ul>
                    <li>
                        <span className="orange">H,</span>When the Steam price of an item is over 800,
                        the buff price is taken instead and it's adjusted by the average difference between the two.
                    </li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Architecture - How the prices are scrapped, processed, stored and served</h2>
                <p>
                    It all happens on AWS. There is a python script that is responsible for price scraping and another one that updates exchange rates.
                    The <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension/blob/master/backend/priceScraper/priceScraper.py'> price scrapper script </NewTabLink>
                    runs daily at 3AM UTC.
                    The <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension/blob/master/backend/exchangeRates/exchangeRates.py'> exchange rates </NewTabLink>
                    update every 3 hours.
                    Both of these Lambda functions are triggered by CloudWatch events and are executed in a Python 3.7 environment.
                    The pricing script scrapes prices from steamapis.com, CS.MONEY, BITSKINS.COM, LOOT.FARM and CSGO.TM then the extension calculates it's own pricing with the algorithm described above.
                    The pricing data is stored in an S3 Bucket and made available and distributed around the world under the prices.csgotrader.app domain by Cloudfront.
                </p>
                <p>
                    The latest prices are always available at: <br/>
                    <NewTabLink to='https://prices.csgotrader.app/latest/prices_v6.json'>prices.csgotrader.app/latest/prices_v6.json</NewTabLink>
                    <br/>
                    and each days pricing is archived in a path like:<br/>
                    prices.csgotrader.app/YYYY/MM/DD/prices_v6.json. <br/>
                    For example:
                    <NewTabLink to='https://prices.csgotrader.app/2020/11/03/prices_v6.json'>prices.csgotrader.app/2020/05/17/prices_v6.json</NewTabLink>.
                    If you can't find it for your date then try, v4, 3, etc. instead.
                </p>
            </Container>
        </Fragment>
    );
};

export default prices;