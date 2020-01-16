import React, {Fragment} from "react";
import { Container } from 'react-bootstrap';

import Head from '../../components/Head/Head';
import NewTabLink from '../../components/NewTabLink/NewTabLink';

const faq = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);
    return  (
        <Fragment>
            <Head
                description="Frequently Asked Questions - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Frequently Asked Questions"
                path={window.location.pathname}
            />

            <h1>Frequently Asked Questions</h1>
            <Container className='buildingBlock'>
                <h2>Is it free?</h2>
                <p>
                    Yes, the extension is free to install and use with all its features included. Some future features that requires servers might be paid/premium.
                </p>

                <h2>How do I install it?</h2>
                <p>
                    The extension is available in the Chrome Web Store and at AMO. These release versions are usually updated every 1-2 weeks.
                </p>
                <p>
                    To install it open the appropriate web store for your browser and install it.
                    After it successfully installed you can open Steam in your browser and use it like you normally do except now with additional features!
                    Note: If you have Steam open in a windows or tab before you install the extension you will have to reload that for the features to appear.
                </p>
                <p>
                    If you have a browser that is not Chrome or Firefox don't worry, not all is lost.
                    If you have a Chromium based browser like Opera, Ungoogled Chromium, Brave or the new Microsoft Edge you should be able to install the Chrome version.
                </p>
                <p>
                    I have even heard about a guy getting it to work on Android with Yandex browser, but I haven't tried it myself and I can't guarantee that it won't be buggy if it works at all like that.
                </p>
                <p>
                    If you are on Safari, all is lost for you because I have no plan of porting it for your browser, Safari extensions work very differently, and the work can't be justified.
                </p>

                <h2>How do I get support?</h2>
                <p>
                    This FAQ page is meant to be your starting point when you need help with the extension.
                    You should give a look to the Release Notes, new features are usually explained there.
                    If you can’t find answer to your question here, then you should head over to the Support page.
                </p>

                <h2>Can I trust it? Can it steal my items? Will it steal my items?</h2>
                <p>
                    Answering this question is far from simple. Browser extensions, when they have access to a site can basically perform any action you as a user could.
                    CSGO Trader has access to Steam only by default, optionally (if you go to the options and allow it) it can access CSGOTRADERS.NET and CSGOLounge.com for auto-bumping.
                    This means that theoretically the extension could add or remove your friends, send messages or comments on your behalf or even create market listings or send trade offers.
                    For the latter two you would still have to confirm those on your phone though.
                </p>
                <p>
                    Sounds scary? It is scary. You probably have a few extensions already installed in your browser that could do all that.
                    That might make you uninstall every one of them instead of installing this one, but I think this is something that everyone should know.
                </p>
                <p>
                    As I mentioned for the most dangerous actions (using the market, trading, buying games from the store) require either additional confirmation in the app or Steam Guard re-prompt.
                    The other things the extension could do without confirmation are not really rewarding so there is no real incentive to go rouge.
                    It has been around for over a year and is trusted by thousands of users.
                    It’s also open source meaning that every piece of code that runs in your browser can be read by anyone, no guessing or speculating needed!
                </p>
                <h2>How can I support it?</h2>
                <p>
                    Leaving a positive review or rating in the Chrome Web Store or at Mozilla Addons helps others find it and motivates me to keep working on it.
                </p>
                <p>
                    Putting “csgotrader.app” in your Steam nickname would help enormously and your profile is highlighted with golden colors for other extension users.
                </p>
                <p>
                    When you want to change your items or buy something consider trading them with me instead of using a trade bot site.
                </p>
                <p>
                    The project is open for contributions! If you know one of these: web-development, web-design, graphic design, UX, UI or translation, and want to contribute then reach out!
                </p>
                <p>
                    Spreading the word about it in any way is a great help!
                </p>

                <h2>What are the supported pricing providers?</h2>
                <p>
                    CSGO Trader, Steam, CS.MONEY, BITSKINS.COM, LOOT.FARM, CSGO.TM
                </p>

                <h2>How are CSGO Trader prices calculated?</h2>
                <p>
                    You can read about this in detail in its own dedicated page.
                </p>

                <h2>What are the supported currencies?</h2>
                <p2>
                    United States dollar, Euro, Pound sterling, Renminbi, Japanese yen, Canadian dollar, Australian dollar, Hong Kong dollar, Icelandic króna,
                    Philippine peso, Danish krone, Hungarian forint, Czech koruna, Romanian leu, Swedish krona, Indonesian rupiah, Indian rupee,
                    Brazilian real, Russian ruble, Croatian kuna, Thai baht, Swiss franc, Malaysian ringgit, Bulgarian lev, Turkish lira, Norwegian krone,
                    New Zealand dollar, South African rand, Mexican peso, Singapore dollar, Israeli new shekel, South Korean won, Polish złoty, Bitcoin, Ethereum,
                    United Arab Emirates Dirham, Argentine Peso, Chilean Peso, Colombian Peso, Costa Rican Colón, Kuwaiti Dinar, Kazakhstani Tenge,
                    Peruvian Nuevo Sol, Qatari Riyal, Saudi Riyal, New Taiwan Dollar, Ukrainian Hryvnia, Uruguayan Peso, Vietnamese Dong, Georgian Lari.
                </p2>

                <h2>Who is the owner, developer?</h2>
                <p>
                    Both the owner and developer is GeRy with some minor contributions from others.
                </p>

                <h2>What are the features that are planned or are already being developed?</h2>
                <p>
                    You can follow the development by checking the open GitHub issues and the Kanban Board.
                </p>

                <h2>Why does it need the permissions it requires and what do they mean?</h2>
                <ul>
                    <li>
                        storage: This permission allows the extension to store data on your computer. It’s used for example to store your preferences.
                    </li>
                    <li>
                        unlimitedStorage: The simple storage permission has pretty strict limitation on the amount of storage that can be used by an extension.
                        The unlimited storage permission lifts these limits. The extension has to store the item pricing information, item float information, bookmarks, etc.
                        It needs more storage than what the simple storage permission allows.
                    </li>
                    <li>
                        notifications:  The name is pretty descriptive; it allows the extension to send browser notifications. It’s used to send notifications about bookmarked items for example.
                    </li>
                    <li>
                        alarms: The alarms permission allows the extension to set alarms in the future. The extension subscribes to the alarms and executes some action.
                        For example, when you bookmark an item the extension sets an alarm to when the item becomes tradable and sends you a notification.
                    </li>
                </ul>
                <p>
                    Site permissions - the sites the extension is allowed to reach or run code on:
                </p>
                <ul>
                    <li>
                        Steam: steamcommunity.com, api.steampowered.com
                    </li>
                    <li>
                        First party: prices.csgotrader.app, api.csgotrader.app
                    </li>
                    <li>
                        Third party: steamrep.com, api.csgofloat.com
                    </li>
                    <li>
                        Optional: csgolounge.com, csgotraders.net
                    </li>
                </ul>

                <h2>Why have I not heard of it before? Why doesn’t it have more users? Why is it not on reddit?</h2>
                <p>
                    If you have been trading for a while, then you probably heard of Steam Inventory Helper or SteamWizard but might not have heard about CSGO Trader. Why is that?
                </p>
                <p>
                    Well, I have started developing it much later than those two, so it hasn’t been around for as long as them.
                    I have tried spreading the word about it on reddit, but my posts on /r/GlobalOffensiveTrade were removed because it’s not whitelisted.
                    My whitelisting requests were denied without explanation as well.
                </p>
                <p>
                    To complete the vicious circle the mods on /r/csgomarketforum also removed posts because, wait for it... it is not whitelisted on /r/GlobalOffensiveTrade.
                </p>
                <h2>Does the extension mine my data, spy one me? How and what kind of information is stored? How is my privacy preserved?</h2>
                <p2>
                    Read the Privacy page about this.
                </p2>
            </Container>
        </Fragment>
    );
};

export default faq;