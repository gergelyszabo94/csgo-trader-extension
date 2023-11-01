import React, {Fragment} from "react";
import { Container } from 'react-bootstrap';
import { HashLink as Link } from 'react-router-hash-link';

import Head from '../../components/Head/Head';
import NewTabLink from '../../components/NewTabLink/NewTabLink';
import './Faq.css';

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
            <Question title='I am shown errors when opening inventories, market prices do not always load. Is it because of the extension?'>
                    <p>
                        Could be, a few months ago Steam limited the number of requests you can make to certain endpoints.
                        If you reach the limit you get limited in certain actions for a few hours, like loading inventories.
                        Certain extension features make additional requests towards Steam.
                        If you want to minimize your chance of getting limited I recommend tuning the extension option like this:
                    </p>
                    <ul>
                        <li>
                            Turn off: Friends, Groups and Invites - Monitor friend requests
                        </li>
                        <li>
                            Turn off: Trade Offer - Load RealTime prices
                        </li>
                        <li>
                            Turn off: Inventory - Load RealTime prices
                        </li>
                        <li>
                            Turn off: Market - Load prices on my listings and orders
                        </li>
                        <li>
                            Set to 10: Market - Listings per page
                        </li>
                        <li>
                            Set to 10: Market - Market history events to show
                        </li>
                        <li>
                            Turn off: Market - Show "Buy and Sell Orders (cumulative)"
                        </li>
                        <li>
                            Turn off: Market - Recent activity on non-commmodity"
                        </li>
                    </ul>
                    <p>
                        Additionally I recommend opening as few inventories as possible.
                        Open the trade offer window and check the items that way if you can.
                    </p>
                </Question>
                <Question title='Is it free?'>
                    <p>
                        Yes, the extension is free to install and use with all its features included. Some future features that requires servers might be paid/premium.
                    </p>
                </Question>
                <Question id='install' title='How do I install it?'>
                    <h3>From your browser vendor's distribution platform</h3>
                    <p>
                        Installing from a distribution platform is the recommended way of installing the extension as it's the easiest way and guarantees that you will receive updates automatically.
                        The extension is available in the
                        <NewTabLink to='https://chrome.google.com/webstore/detail/csgo-trader-steam-trading/kaibcgikagnkfgjnibflebpldakfhfih'> Chrome Web Store </NewTabLink>
                        at
                        <NewTabLink to='https://microsoftedge.microsoft.com/addons/detail/emcdnkamomgiafjejbhdpcfgbeeimpdb'> Microsoft Edge Addons </NewTabLink>
                        and at
                        <NewTabLink to='https://addons.mozilla.org/en-US/firefox/addon/csgo-trader-steam-trading/'> AMO</NewTabLink>
                        These release versions are usually updated every 2-3 weeks.
                    </p>
                    <p>
                        To install it open the appropriate web store for your browser and install it.
                        After it successfully installed you can open Steam in your browser and use it like you normally do except now with additional features!
                        Note: If you have Steam open in a windows or tab before you install the extension you will have to reload that for the features to appear.
                    </p>
                    <p>
                        If you have a browser that is not Chrome or Firefox don't worry, not all is lost.
                        If you have a Chromium based browser like Opera, Ungoogled Chromium, or Brave you should be able to install the Chrome version.
                    </p>
                    <p>
                        I have even heard about a guy getting it to work on Android with Yandex browser, but I haven't tried it myself and I can't guarantee that it won't be buggy if it works at all like that.
                    </p>
                    <p>
                        If you are on Safari, all is lost for you because I have no plan of porting it for your browser, Safari extensions work very differently, and the work can't be justified.
                    </p>
                    <h3 id='installmanual'>Manually in developer mode</h3>
                    <p>
                        Only recommended for those how like to tinker with the code or are forced to work around geoblocking, etc.
                    </p>
                    <h4>Pre-built release version</h4>
                    <p>
                        This is the same code that gets published to the platforms. You can grab the zip, unpack it and load it in your browser.
                        Also useful in case an update gets stuck in the review hell and does not get published for a while and you want to try it.
                    </p>
                    <p>
                        To install the extension in development mode in a Chromium based browser (Chrome, Edge, Opera or Brave):
                        <ul>
                            {/*Absolute routes are used to trick react-snap because it does not have an exclude option*/}
                            <li>Grab the latest <NewTabLink to='https://csgotrader.app/extension/latest/chrome.zip'>chrome.zip</NewTabLink></li>
                            <li>Unpack it in a folder on your computer</li>
                            <li>Open the Extensions page ( chrome://extensions )</li>
                            <li>Enable developer mode with the toggle</li>
                            <li>Click "Load unpacked" and select the folder that you unpacked the contents of the .zip file</li>
                            <li>The extension should now appear in your extensions</li>
                        </ul>
                        For Firefox:
                        <ul>
                            <li>Grab the latest <NewTabLink to='https://csgotrader.app/extension/latest/firefox.zip'>firefox.zip</NewTabLink></li>
                            <li>Unpack it in a folder on your computer</li>
                            <li>Open the Extensions page ( about:addons )</li>
                            <li>Click the Gear icon then "Debug Add-ons"</li>
                            <li>The Temporary Extensions menu appears ( about:debugging#/runtime/this-firefox )</li>
                            <li>Click "Load Temporary Add-ons..." and select the folder where you unpacked the contents of the .zip file</li>
                            <li>The extension should now appear in your extensions</li>
                        </ul>
                    </p>
                    <h4 id='installfromsource'>From source</h4>
                    <p>
                        If you want the latest and greatest "nightly" version of the extension you will have to install it from source.
                        Check <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension/tree/master/extension'> the instructions about building the project.</NewTabLink>
                    </p>
                </Question>
                <Question id='support' title='How do I get support?'>
                    <p>
                        This FAQ page is meant to be your starting point when you need help with the extension.
                        You should give a look to the <Link to='/release-notes/'>Release Notes</Link>, new features are usually explained there.
                        If you can’t find answer to your question here, then you should email <NewTabLink to='mailto:support@csgotrader.app'> support@csgotrader.app</NewTabLink>
                    </p>
                </Question>
                <Question id='trust' title='Can I trust it? Can it steal my items? Will it steal my items?'>
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
                        It’s also
                        <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension'> open source  </NewTabLink>
                        meaning that every piece of code that runs in your browser can be read by anyone, no guessing or speculating needed!
                    </p>
                </Question>
                <Question id='steamapikey' title='Why does it need Steam API key? Isn&apos;t that for scamming??'>
                    <p>
                        Even though I think I have this explained in the options pretty well, I get this question a lot.
                        Let me start by explaining what the Steam API and your key for it is.
                        The Steam API allows programs (like my extension) to interact with Steam on your behalf.
                        There are some features in the extension that use it, for example when loading trade offers.
                        If you are afraid, you can choose to not set your API key in the options but you will be missing out on some features.
                        <NewTabLink to='https://steamcommunity.com/sharedfiles/filedetails/?id=1408053055'> Although scammers started using it to cancel trade offers in recent times, </NewTabLink>
                        no the Steam API is not for scamming.
                        Do you really think that Steam designed a feature for scammers so they can steal your items?
                    </p>
                </Question>
                <Question title='How can I support it?'>
                    <p>
                        Leaving a positive review or rating in the
                        <NewTabLink to='https://chrome.google.com/webstore/detail/csgo-trader-steam-trading/kaibcgikagnkfgjnibflebpldakfhfih'> Chrome Web Store </NewTabLink>
                        or at
                        <NewTabLink to='https://addons.mozilla.org/en-US/firefox/addon/csgo-trader-steam-trading/'> Mozilla Addons </NewTabLink>
                        helps others find it and motivates me to keep working on it.
                    </p>
                    <p>
                        Putting “csgotrader.app” in your Steam nickname would help enormously and your profile is highlighted with
                        <Link to='/release-notes/#1.24'> golden colors </Link>
                        for other extension users.
                    </p>
                    <p>
                        When you want to change your items or buy something consider
                        <NewTabLink to='https://steamcommunity.com/id/gergelyszabo'> trading them with me </NewTabLink>
                        instead of using a trade bot site.
                    </p>
                    <p>
                        Also consider <NewTabLink to='https://skinport.com/?r=gery'>Skinport.com</NewTabLink> when you are buying CS:GO items for cash.
                        Using the above link will support the development of the extension.
                    </p>
                    <p>
                        <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension'>The project </NewTabLink>
                        is open for contributions! If you know one of these: web-development, web-design, graphic design, UX, UI or translation, and want to contribute then reach out!
                    </p>
                    <p>
                        Spreading the word about it in any way is a great help!
                    </p>
                </Question>
                <Question title='What are the supported pricing providers?'>
                    <p>
                        CSGO Trader, Steam, CS.MONEY, BITSKINS.COM, LOOT.FARM, CSGO.TM, <NewTabLink to='https://skinport.com/?r=gery'>Skinport.com</NewTabLink>,
                        BUFF163.com, CSGOEmpire, swap.gg, CSGOEXO.COM.
                    </p>
                </Question>
                <Question title='What are the supported currencies?'>
                    <p2>
                        United States dollar, Euro, Pound sterling, Renminbi, Japanese yen, Canadian dollar, Australian dollar, Hong Kong dollar, Icelandic króna,
                        Philippine peso, Danish krone, Hungarian forint, Czech koruna, Romanian leu, Swedish krona, Indonesian rupiah, Indian rupee,
                        Brazilian real, Russian ruble, Croatian kuna, Thai baht, Swiss franc, Malaysian ringgit, Bulgarian lev, Turkish lira, Norwegian krone,
                        New Zealand dollar, South African rand, Mexican peso, Singapore dollar, Israeli new shekel, South Korean won, Polish złoty, Bitcoin, Ethereum,
                        United Arab Emirates Dirham, Argentine Peso, Chilean Peso, Colombian Peso, Costa Rican Colón, Kuwaiti Dinar, Kazakhstani Tenge,
                        Peruvian Nuevo Sol, Qatari Riyal, Saudi Riyal, New Taiwan Dollar, Ukrainian Hryvnia, Uruguayan Peso, Vietnamese Dong, Georgian Lari.
                    </p2>
                </Question>
                <Question title='Who is the owner, developer?'>
                    <p>
                        Both the owner and developer is
                        <NewTabLink to='https://steamcommunity.com/id/gergelyszabo'> GeRy </NewTabLink>
                        with some
                        <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension/blob/master/CONTRIBUTING.md'> minor contributions </NewTabLink>
                        from others.
                    </p>
                </Question>
                <Question title='What are the features that are planned or are already being developed?'>
                    <p>
                        You can follow the development by checking the open
                        <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension/issues'> GitHub issues </NewTabLink>
                        and the
                        <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension/projects/1'> Kanban Board. </NewTabLink>
                    </p>
                </Question>
                <Question id='permissions' title='Why does it need the permissions it requires and what do they mean?'>
                    <p>
                        Default permissions: default permissions are granted when you install the extension.
                    </p>
                    <ul>
                        <li>
                            <NewTabLink to='https://developer.chrome.com/apps/storage'>storage:  </NewTabLink>
                            This permission allows the extension to store data on your computer. It’s used for example to store your preferences.
                        </li>
                        <li>
                            <NewTabLink to='https://developer.chrome.com/apps/declare_permissions'>unlimitedStorage:  </NewTabLink>
                            The simple storage permission has pretty strict limitation on the amount of storage that can be used by an extension.
                            The unlimited storage permission lifts these limits. The extension has to store the item pricing information, item float information, bookmarks, etc.
                            It needs more storage than what the simple storage permission allows.
                        </li>
                        <li>
                            <NewTabLink to='https://developer.chrome.com/apps/notifications'>notifications: </NewTabLink>
                            The name is pretty descriptive; it allows the extension to send browser notifications. It’s used to send notifications about bookmarked items for example.
                        </li>
                        <li>
                            <NewTabLink to='https://developer.chrome.com/apps/alarms'>alarms: </NewTabLink>
                            The alarms permission allows the extension to set alarms in the future. The extension subscribes to the alarms and executes some action.
                            For example, when you bookmark an item the extension sets an alarm to when the item becomes tradable and sends you a notification.
                        </li>
                    </ul>
                    <p>
                        <NewTabLink to='https://developer.chrome.com/apps/permissions'>Optional permissions: </NewTabLink>
                        They can be activated from the extension options.
                    </p>
                    <ul>
                        <li>
                            <NewTabLink to='https://developer.chrome.com/extensions/tabs'>tabs: </NewTabLink>
                            Tabs is a pretty powerful permission and gives off some pretty scary warnings on installations so I made it optional.
                            When turned on it allows the extension to open and close tabs, to read open tab urls, etc.
                            The extension does not need it per say, but I recommend turning it on for better user experience.
                            It is used to open extension pages, for example when bookmarking an item from an inventory.
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
                </Question>
                <Question title='Why have I not heard of it before? Why doesn’t it have more users? Why is it not on reddit?'>
                    <p>
                        If you have been trading for a while, then you probably heard of Steam Inventory Helper or SteamWizard but might not have heard about CSGO Trader. Why is that?
                    </p>
                    <p>
                        Well, I have started developing it much later than those two, so it hasn’t been around for as long as them.
                        I have tried spreading the word about it on reddit, but my posts on
                        <NewTabLink to='https://www.reddit.com/r/GlobalOffensiveTrade/'> /r/GlobalOffensiveTrade </NewTabLink>
                        were removed because it’s not whitelisted.
                        My whitelisting requests were denied without explanation as well.
                    </p>
                </Question>
                <Question title='Does the extension mine my data, spy one me? How and what kind of information is stored? How is my privacy preserved?'>
                    <p2>
                        Read the
                        <Link to='/privacy/'> Privacy page </Link>
                        about this.
                    </p2>
                </Question>
                <Question title="The in-browser inspection page does not load? I can't see the generated screenshot?">
                    <p>
                        The screenshot generation is done by swap.gg
                        <NewTabLink to='https://market.swap.gg/screenshot'> (swap.gg).</NewTabLink>
                        I have no control over it, please let them know if it is not working as intended.
                    </p>
                </Question>
                <Question id='update' title='How do I make sure that I have the latest version installed?'>
                    <p>
                        To see what the latest version is check <Link to='/changelog/'> Changelogs </Link>.
                        During each release a new version of the extension is submitted the distribution platforms.
                        The platforms (Chrome Web Store, Mozzila Addons) review submissions before they are available for download.
                        This means that the latest version might not have rolled out to your platform yet.
                        Check the extension's page on your platform to see what version is available there.
                        If that is not the version you are running (you can see what version you are on by opening the extension pop-up) then you can force your browser to check for update.
                        See
                        <NewTabLink to='https://www.howtogeek.com/64525/how-to-manually-force-google-chrome-to-update-extensions/'> How to Manually Force Google Chrome to Update Extensions </NewTabLink>
                        or
                        <NewTabLink to='https://support.mozilla.org/en-US/kb/how-update-add-ons'> How to update add-ons </NewTabLink>
                        (Firefox).
                        <Link to='#installmanual'> You can install it manually as well.</Link>
                    </p>
                </Question>
            </Container>
        </Fragment>
    );
};

const Question = (props) => {
    return (
        <div className='faqItem'>
            <h2 id={props.id !== undefined ? props.id : ''}>{props.title}</h2>
            {props.children}
        </div>
    );
};


export default faq;
