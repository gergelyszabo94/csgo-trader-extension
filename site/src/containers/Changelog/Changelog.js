import React, {Fragment} from "react";
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Head from '../../components/Head/Head';
import NewTabLink from "../../components/NewTabLink/NewTabLink";

const changelog = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
        <Fragment>
            <Head
                description="Changelog of CSGO Trader - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading."
                title="CSGO Trader - Changelog"
                path={window.location.pathname}
            />

            <h1>Changelog</h1>
            <Container className='buildingBlock'>
                Changelogs are published when a new version of the extension is submitted the distribution platforms.
                The platforms (Chrome Web Store, Mozzila Addons) review submissions before they are available for download.
                This means that the latest version might not have rolled out to your platform yet when you are reading this.
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 2.4 - 2020-05-28</h2>
                Check out the <Link to='/release-notes/#2.4'> Release Notes </Link> for more info on the new features.
                <ul>
                    <li>
                        RealTime price loading was added to offers/inventories.
                        <GithubIssueLink issueNumber={119}/>
                    </li>
                    <li>
                        Added support for mass listing to other games and Steam items as well.
                        <GithubIssueLink issueNumber={249}/>
                    </li>
                    <li>
                        Skinbay was renamed everywhere in the extension to Skincay to reflect the company/domain name change
                    </li>
                    <li>
                        Fixed a bug that removed tags from non-csgo items as well in inventories.
                    </li>
                    <li>
                        Fixed quicksell price not getting selected automatically when it is higher than the extension price during mass listing
                    </li>
                    <li>
                        Fixed unselected items not getting removed from he mass listing table
                    </li>
                    <li>
                        Fixed a bug that broke the item actions menu for some rare games
                    </li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 2.3 - 2020-05-15</h2>
                Check out the <Link to='/release-notes/#2.3'> Release Notes </Link> for more info on the new features.
                <ul>
                    <li>
                        Added
                        <NewTabLink to='https://skincay.com/?r=gery'> Skincay.com </NewTabLink>
                        as a pricing provider
                    </li>
                    <li>
                        Added links to
                        <NewTabLink to='https://skincay.com/?r=gery'> Skincay.com </NewTabLink>
                        to market listing pages (can be turned off)
                    </li>
                    <li>
                        Fixed an issue where after currency change the exchange rates did not update in the background immediately
                    </li>
                    <li>
                        For new users (new installations) the extension currency will be set to match their Steam Wallet currency.
                        <GithubIssueLink issueNumber={161}/>
                    </li>
                    <li>Added a disclaimer to the discussion auto-bumping feature</li>
                    <li>
                        Made numerous improvements to the Steam Market Mass Listing feature
                        <GithubIssueLink issueNumber={201}/>
                    </li>
                    <li>Added new scam/spam comment patterns to report (mostly "join our team" like ones)</li>
                    <li>
                        Made numerous improvements to the the incoming trade offers page and to trade offers
                        <GithubIssueLink issueNumber={215}/>
                    </li>
                    <li>Improvements to the friend request evaluation feature, including new conditions, request summary, other niceties
                        <GithubIssueLink issueNumber={195}/>
                    </li>
                    <li>Even users with capitalized "CSGOTRADER.APP" in their name will be highlighted in gold colors</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 2.2 - 2020-04-19</h2>
                <div className="text-danger">
                    It was brought to my attention that bumping discussions is against Steam's
                    <NewTabLink to="https://support.steampowered.com/kb_article.php?ref=4045-USHJ-3810&l=english"> Rules and Guidelines For Steam: Discussions, Reviews, and User Generated Content </NewTabLink>
                    so use it at your own risk!
                </div>
                <ul>
                    <li>
                        Discussion posts (group, trading, forum) can now be set to be automatically bumped by the extension.
                        <GithubIssueLink issueNumber={187}/>
                        Check out the <Link to='/release-notes/#2.2'> Release Notes </Link> for more info.
                    </li>
                    <li>Added an option to remove the header in Steam Web Chat</li>
                    <li>Tweaked the appearance the the warning message that gets added to scammers' profiles</li>
                    <li>Security improvements that fix issues flagged by Mozilla</li>
                    <li>Added usage data collection consent prompt for new Firefox users</li>
                    <li>Fixed a bug that broke float value loading on market listings when a non-default number of listings were set to load per page</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 2.1.2 - 2020-04-14</h2>
                <ul>
                    <li>Fixed the same issue as 2.1.1 but for all users (including users updating from 2.1 and 2.1.1</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 2.1.1 - 2020-04-14</h2>
                <ul>
                    <li>Fixed a bug that made most of the features break when the user has not loaded the incoming offers page after installing or updating.</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 2.1- 2020-04-13</h2>
                <div className="text-danger">
                    There was a bug identified in this update that causes features to break.
                    If you are facing issues and are still on this version you can work around it:
                    Make sure you have your Steam API key set in the options the  go to your inventory, click "Trade offers".
                    This opens the incoming trade offers page and the extension updates the active offer information, fixing the problem.
                </div>
                <ul>
                    <li>
                        Items that are present in multiple offers are highlighted and on click reveal in which ones.
                        <GithubIssueLink issueNumber={78}/>
                        Check out the <Link to='/release-notes/#2.1'> Release Notes </Link> for more info.
                    </li>
                    <li>
                        Added feature to make the extension act on incoming friend requests by user set rules.
                        <GithubIssueLink issueNumber={134}/>
                        Check out the <Link to='/release-notes/#2.1'> Release Notes </Link> for more info.
                    </li>
                    <li>
                        CSGOTraders.net autobumping now navigates away from error page.
                    </li>
                    <li>
                       Fixed a bug that made opening a link to a sent offer not showing the correct offer on the page after sorting.
                    </li>
                    <li>
                        Added more spam comment patterns.
                    </li>
                    <li>
                        A ribbon is added to Steam pages after the a new version of the extension was installed.
                        It can be dismissed until the next update.
                    </li>
                    <li>
                        Added an option to auto-ignore Steam group invites.
                    </li>
                    <li>
                        Changed how partner trade offer history information is shown on profiles to be consistent with offers and inventories.
                    </li>
                    <li>
                        Fixed a small bug that made "Favorite" buttons on artworks have a visible border.
                    </li>
                    <li>
                        Fixed a select element styling and calculator layout in Firefox.
                        <GithubIssueLink issueNumber={132}/>
                    </li>
                    <li>
                        Fixed a bug that sometimes showed a buy order as not the highest if the highest's price was lower.
                        <GithubIssueLink issueNumber={174}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198104585268'>caluo</Credit>
                    </li>
                    <li>
                        Fixed a bug that made items in an offer disappear when the user tried to remove them.
                        <GithubIssueLink issueNumber={168}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198103971634'>⸸ Dᴊᴇɴᴛ ⸸</Credit>
                    </li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 2.0 - 2020-03-18</h2>
                <ul>
                    <li>
                        The extension popup, the options and the bookmarks pages received a new look
                        <GithubIssueLink issueNumber={122}/>
                        Check out the <Link to='/release-notes/#2.0'> Release Notes </Link> for more info.
                    </li>
                    <li>
                        Fixed a bug that made the Market History Export not appear for users who did not have market listings and buy orders.
                        <GithubIssueLink issueNumber={123}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198024029179'>hellgaet</Credit>
                    </li>
                    <li>
                        Price loading now retried when failed for Market mass selling
                        <GithubIssueLink issueNumber={128}/>
                    </li>
                    <li>
                        Fixed a bug that made the same kind of item on both sides show the same float value on the incoming offers page.
                        <GithubIssueLink issueNumber={129}/>
                    </li>
                    <li>
                        Spam/scam comments are now reported silently (no page jerk) and an explanation is added to reported comments
                        <GithubIssueLink issueNumber={125}/>
                    </li>
                    <li>
                        Added an option to only include selected items when exporting list of inventory items.
                        <GithubIssueLink issueNumber={118}/>
                    </li>
                    <li>
                        Market listing sticker tooltips now always shown in their full length
                        <GithubIssueLink issueNumber={127}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198285371555'>UwU danto OwO</Credit>
                    </li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.26.1 - 2020-02-10</h2>
                <ul>
                    <li>Fixed some very rare items showing no price when pricing is set to CSGOTRADER</li>
                    <li>Fixed a bug that made bookmarked items not to show</li>
                    <li>Fixed a bug that created an infinite loop during float info fetching  <GithubIssueLink issueNumber={120}/></li>
                    <li>Fixed functionalities breaking on the incoming trade offers page when the steam api returned incomplete data</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.26 - 2020-02-03</h2>
                <ul>
                    <li>
                        Added sticker prices to inventories, offers and market listings.
                        Check out the <Link to='/release-notes/#1.26'> Release Notes </Link> for more info.
                        <GithubIssueLink issueNumber={116}/>
                    </li>
                    <li>Added listing canceled even type to Market History Export</li>
                    <li>The progress is properly reset after the Market History Export process finishes</li>
                    <li>
                        Simplified data export/import options, now the only options are backup and restore.
                        <GithubIssueLink issueNumber={114}/>
                    </li>
                    <li>Mass selling starting at and instant sell price fetching now uses a queue to delay requests</li>
                    <li>
                        Removed the About page and added link the the <Link to='/faq/'> FAQ </Link> page
                        <GithubIssueLink issueNumber={115}/>
                    </li>
                    <li>Fixed a bug that made the original listing prices show up as zero or NaN after sorting</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.25.1 - 2020-01-27</h2>
                <ul>
                    <li>
                        Made old.csgolounge.com permission that was prompting during update optional.
                    </li>
                </ul>
            </Container>

            <Container className='buildingBlock'>
                <h2>Version 1.25 - 2020-01-27</h2>
                <ul>
                    <li>Added price highlighting for sell listings and buy orders, remove/cancel all or selected, as well as totals, history type highlighting and market history export on the Community Market page.
                        Check out the <Link to='/release-notes/#1.25'> Release Notes </Link> for more info.
                        Thanks to <NewTabLink to='https://steamcommunity.com/profiles/76561198085748819'> Wiesenmeister </NewTabLink> and
                        <NewTabLink to='https://www.reddit.com/user/timgotpaper'> /u/timgotpaper </NewTabLink>
                        for the ideas.
                        <GithubIssueLink issueNumber={88}/>
                    </li>
                    <li>Added <Link to='/faq/'> Frequently Asked Questions (FAQ) page</Link></li>
                    <li>Removed unused activeTab permission</li>
                    <li>Updated the <Link to='/privacy/'> Privacy page </Link> with more detailed information</li>
                    <li>NSFW mode now removes "holiday cheer" as well</li>
                    <li>CSGOLounge bumping now works on old.csgolounge.com/mytrades as well</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.24 - 2020-01-09</h2>
                <ul>
                    <li>Profiles with csgotrader.app in their name are highlighted with gold color Check out the
                        <Link to='/release-notes/#1.24'> Release Notes </Link> for more info </li>
                    <li>Added option (on by default) to move trade offer headers to the left on wide screens. Check out the
                        <Link to='/release-notes/#1.24'> Release Notes </Link> for more info
                        <GithubIssueLink issueNumber={108}/>
                    </li>
                    <li>Fixed a bug where Gamma Doppler phases were not showing in offers if the user used a language where the knives' names are capitalized differently.</li>
                    <li>Fixed a bug that prevented PLN from being able to selected as a pricing currency</li>
                    <li>Fixed item list generation</li>
                    <li>Fixed a bug that made all bookmarks disappear if one of the bookmarked items was a vanilla item</li>
                    <li>Fixed offer totals showing switched on the sent offer page
                        <Credit to='https://steamcommunity.com/profiles/76561198275942728'>¡kFzo彡</Credit>
                    </li>
                    <li>Fixed a bug that caused items in trade offers to disappear (visually) sometimes completely when they should have gone back to the inventory
                        <Credit to='https://steamcommunity.com/profiles/76561198275942728'>¡kFzo彡</Credit>
                    </li>
                    <li>Misc performance and usability improvements</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.23.1 - 2019-12-23</h2>
                <ul>
                    <li>Changes to the <Link to='/prices/'>pricing algorithm</Link>.</li>
                    <li>User experience improvements by making clickable elements more apparent and added explanatory titles</li>
                    <li>Steam API key is set automatically when the user installs the extension (if the user has one generated)</li>
                    <li>Added the highest buy order price as "instant sale price" pricing option for Mass Listing and made item names in the table a link to market.
                        <GithubIssueLink issueNumber={106}/>
                    </li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.23 - 2019-12-17</h2>
                <ul>
                    <li>Added feature to show received and sent offer history summary per user on the incoming trade offers page, in trade offers, profiles and inventories. Check out the
                        <Link to='/release-notes#1.23'> Release Notes </Link> for more info <GithubIssueLink issueNumber={99}/>
                    </li>

                    <li>Fade percentages and Marble Fade patterns are shown on market listing pages <GithubIssueLink issueNumber={94}/></li>
                    <li>Added feature to automatically log you in on CSGOTRADERS.NET a separate one to complete all Open ID logins automatically (when logging in to a site with Steam)
                        <GithubIssueLink issueNumber={93}/>
                    </li>
                    <li>Added Georgian Lari as currency <GithubIssueLink issueNumber={105}/></li>
                    <li>Mass Market Listing is out of BETA with some improvements, like selecting the starting at price if that is the highest and retry logic for loading prices</li>
                    <li>Float values are automatically loaded on the incoming offers page. <GithubIssueLink issueNumber={100}/></li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.22 - 2019-12-01</h2>
                <ul>
                    <li>Added Mass Listing feature that is now in Beta. Check out the <Link to='/release-notes/#1.22'> Release Notes </Link> for more info
                        <GithubIssueLink issueNumber={69}/>
                    </li>
                    <li>
                        Added support for all Steam currencies <GithubIssueLink issueNumber={101}/>
                        The newly added currencies are:
                        <ul>
                            <li>United Arab Emirates Dirham</li>
                            <li>Argentine Peso"</li>
                            <li>Chilean Peso</li>
                            <li>Colombian Peso</li>
                            <li>Costa Rican Colón</li>
                            <li>Kuwaiti Dinar</li>
                            <li>Kazakhstani Tenge</li>
                            <li>Peruvian Nuevo Sol</li>
                            <li>Qatari Riyal</li>
                            <li>Saudi Riyal</li>
                            <li>New Taiwan Dollar</li>
                            <li>Ukrainian Hryvnia</li>
                            <li>Uruguayan Peso</li>
                            <li>Vietnamese Dong</li>
                        </ul>
                    </li>
                    <li>Added a feature that allows you to select a specified number of copies of the select item.
                        You can select an item by holding down the control key and right clicking on them.
                        <GithubIssueLink issueNumber={98}/>
                        <Credit to='https://github.com/Jason-Tam4'>Jason Tam</Credit>
                    </li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.21.1 - 2019-11-21</h2>
                <ul>
                    <li>Fixed a bug where undefined would appear instead of the actual currency sign when Australian Dollars was the selected currency</li>
                    <li>Fixed a bug where the extension would not function if the inventory contained an Agent skin (new item type)</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.21 - 2019-11-17</h2>
                <ul>
                    <li>Added CSGOTrader prices to some items that had no price before <GithubIssueLink issueNumber={86}/></li>
                    <li>Fixed Talon Black Pearl showing up as unknown phase.</li>
                    <li>Added ability to sort listings based on float values and price on market pages <GithubIssueLink issueNumber={90}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198217161837'>Skjerve</Credit>
                    </li>
                    <li>Fixed a bug that made the "number of listings to show on market pages" option not save user input</li>
                    <li>Added option to show the original currency and price of what an item was listed on as well as the amount the seller will receive <GithubIssueLink issueNumber={92}/></li>
                    <li>All duplicate items can be selected in inventories by holding down the control key when the selection is active</li>
                    <li>Added the same "starting at" and the number of items sold as well as link to the item's market page for items in not-own inventories</li>
                    <li>Added option to set the Steam API key automatically when opening the apikey page</li>
                    <li>Added option to remove the Steam API key in the options</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.20.1 - 2019-11-12</h2>
                <ul>
                    <li>Fixed Ursus Sapphire showing up as unknown phase.</li>
                    <li>Added the same functionality to the Sent Offers page that the last update added to the Incoming Offers page</li>
                    <li>Fixed a bug that made all the incoming offers disappear on the Incoming offers page if there wasn't at least one inactive offer.
                        <Credit to='https://steamcommunity.com/profiles/76561198103971634'>Dᴊᴇɴᴛ</Credit>
                    </li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.20 - 2019-11-10</h2>
                <ul>
                    <li>Made float caching more efficient</li>
                    <li>Added prices, exteriors, etc to items on the incoming offers page <GithubIssueLink issueNumber={77}/>
                        More info about this in the <Link to='/release-notes/#1.20'> Release Notes </Link></li>
                    <li>Clicking user avatars on the incoming offers page makes profiles open on new tab</li>
                    <li>Added an "accept trade" button to trade offers on the incoming offers page</li>
                    <li>Fixed a bug that made float values round up <GithubIssueLink issueNumber={82}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198879461125'>Seba.</Credit>
                    </li>
                    <li>Hides csgofloat extension elements in inventories when the "Hide other extensions" feature is enabled <GithubIssueLink issueNumber={84}/></li>
                    <li>Adds float rank to technical float info <GithubIssueLink issueNumber={87}/></li>
                    <li>Added currency converter and percentage calculator to popup <GithubIssueLink issueNumber={38}/></li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.19.2 - 2019-10-21</h2>
                <ul>
                    <li>Made automatic float loading optional for offers, inventories and market listings <GithubIssueLink issueNumber={72}/></li>
                    <li>Fixed market pages getting wider because of high float items <GithubIssueLink issueNumber={73}/></li>
                    <li>Fixed Csgolounge autobumb option not getting saved <GithubIssueLink issueNumber={75}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198022761987'>de_nugget</Credit>
                    </li>
                    <li>Fixed a bug that caused users not being able to buy items from the market if they had SIH installed too <GithubIssueLink issueNumber={71}/>
                        <Credit to='https://github.com/RonGokhale'>RonGokhale</Credit>
                    </li>
                    <li>Fixed a bug that made special patterns (marble fade, fade) to sometimes not to show <GithubIssueLink issueNumber={76}/></li>
                    <li>Float values on items with 0.00 float not shown</li>
                    <li>Float loading performance improvements</li>
                    <li>Usage data reporting made optional</li>
                    <li>Added <Link to='/privacy/'> Privacy </Link> page detailing how your data is handled</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.19.1 - 2019-10-06</h2>
                <ul>
                    <li>Fixes bug that broke csgolounge and csgotraders bumping</li>
                    <li>Inventory and trade offer searching performance improvements</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.19 - 2019-10-06</h2>
                <ul>
                    <li>Add option for users to add comments, comment patterns that they want automatically reported <GithubIssueLink issueNumber={54}/></li>
                    <li>Fixes a bug that added the username twice when replying to comments</li>
                    <li>Fixes a bug that made the bookmarks not show up if one of the bookmarked item was a vanilla</li>
                    <li>Added a short page about the Extension's Steam Group at: <Link to='/group/'>csgotrader.app/group</Link></li>
                    <li>Item float values in inventories, offers and on market get loaded automatically</li>
                    <li>Removes the now redundant "Get Float Info" buttons from offers and market pages</li>
                    <li>Market "float bars" are now wider, stickers are centered and sticker condition is shown on hover</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.18 - 2019-09-16</h2>
                <ul>
                    <li>Resizes trade offers in the trade offers page so when an offer is declined it does not jerk the page <GithubIssueLink issueNumber={18}/></li>
                    <li>Generate list of inventory items (copy to clipboard, download as .csv) - for posting in groups, trade sites, etc.  <GithubIssueLink issueNumber={21}/></li>
                    <li>Fixed bug that did not allow the "colorful items" feature to apply in non-english Steam</li>
                    <li>Fixed bug where Doppler prices were not converted when a non-USD currency was selected</li>
                    <li>Extension preferences and bookmarks can now be imported and exported <GithubIssueLink issueNumber={53}/></li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.17.1 - 2019-09-01</h2>
                <ul>
                    <li>Fixed a bug that broke sorting if one of the items did not have a price</li>
                    <li>Added "Inventory" and "Trade Offers" links to the extension popup and made popup links settable through options</li>
                    <li>Fixed Stiletto Sapphire showing us as "Unknown"</li>
                    <li>Fixed reoccuring message not getting removed if it includes steam style formatting tags <GithubIssueLink issueNumber={66}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198103971634'>Dᴊᴇɴᴛ</Credit>
                    </li>
                    <li>Added "take all from page", "take everything", "take x number of keys" functionality to trade offers</li>
                    <li>Added "remove everything", "remove x amount of keys" to the in-trade side of the trade offer window</li>
                    <li>Moved trade offer function bar slightly higher</li>
                    <li>Added sorting to the in-trade side of the inventory</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.17 - 2019-08-20</h2>
                <ul>
                    <li>Created <Link to='/'>csgotrader.app</Link> site that showcases the features of the extension</li>
                    <li>Moved the changelog pages from the extension to <Link to='/changelog/'>csgotrader.app/changelog</Link></li>
                    <li>Created <Link to='/prices/'>csgotrader.app/prices</Link> page that explains how the extension calculates prices</li>
                    <li>Added case keys, BTC, ETH and their denominations as currencies</li>
                    <li>Adjusted the pricing algorithm to try to get a more accurate price for rare items and specify different prices for different Doppler phases</li>
                    <li>Added feature to check the value of the items selected, the selection can be initiated by clicking the hand icon in inventories</li>
                    <li>Added sorting feature to trade offers and inventories, items can be sorted by:</li>
                    <ul>
                        <li>Name (alphabetical)</li>
                        <li>Tradability</li>
                        <li>Price</li>
                        <li>Position (default)</li>
                        <li>And any of the mentioned reversed</li>
                    </ul>
                    <li>The default sorting mode can be set in the options menu</li>
                    <li>All inventory items are loaded automatically to accommodate sorting and eliminate waiting when searching or filtering <GithubIssueLink issueNumber={47}/></li>
                    <li>Bug fix: Turning off pricing has no effect in offers <GithubIssueLink issueNumber={62}/>
                        <Credit to='https://steamcommunity.com/profiles/76561198103971634'>Dᴊᴇɴᴛ</Credit>
                    </li>
                    <li>Bug fix: Duplicate item count visible and broken in non-CS:GO inventories <GithubIssueLink issueNumber={57}/></li>
                    <li>Receiving update notification is optional and off by default <GithubIssueLink issueNumber={58}/></li>
                    <li>Made csgolounge and csgotraders permissions optional <GithubIssueLink issueNumber={31}/></li>
                    <li>Pages where the extension adds features get reloaded when the extension updates <GithubIssueLink issueNumber={61}/></li>
                    <li>Added option to make the other party's inventory active by default <GithubIssueLink issueNumber={25}/></li>
                    <li>Applied compression to prices.json to save bandwidth and time</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.16.1 - 2019-07-30</h2>
                <ul>
                    <li>Fixed extension breaking if the pricing info was not successfully set for the first time</li>
                    <li>Fixed quick decline trader offers option not being settable through the options page</li>
                    <li>Fixed API key modal not hiding when successfully set</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.16 - 2019-07-27</h2>
                <ul>
                    <li>Added pricing function that is in BETA for now <GithubIssueLink issueNumber={8}/></li>
                    <ul>
                        <li>Prices shown in inventories</li>
                        <li>Total inventory value shown in inventories</li>
                        <li>Prices shown in trade offers</li>
                        <li>Total tradable item's value shown in trade offers</li>
                        <li>Total of items in offer shown</li>
                        <li>Pricing provider can be chosen in Options, providers: CSGO Trader, CSGOBACKPACK, CS.MONEY, Bitskins, LOOT.FARM, CSGO.TM</li>
                        <li>Changeable currency</li>
                    </ul>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.15 - 2019-06-24</h2>
                <ul>
                    <li>Added fade percentage info to fade knives and glock fade in inventories <GithubIssueLink issueNumber={49}/></li>
                    <li>Added marble fade pattern info to guts, flips, m9s and bayos in inventories <GithubIssueLink issueNumber={49}/></li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.14.2 - 2019-06-17</h2>
                <ul>
                    <li>Added Danish translation, thanks to <NewTabLink to='https://github.com/cjavad'> cjavad </NewTabLink></li>
                    <li>Fixed ursus and talon rubies showing as unknowns</li>
                    <li>Achieved feature parity with inventories on trade offers, features such as colorful items, exterior indicators and doppler phases are now available in trade offers as well
                        <GithubIssueLink issueNumber={24}/></li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.14.1 - 2019-05-25</h2>
                <ul>
                    <li>Added the newest spam comments for flagging and extended the feature to include comments in groups, guides, screenshots, etc.</li>
                    <li>If the number of market listings you want to load is the default (10), the page does not scroll automatically</li>
                    <li>Comment replies feature now available under screenshots, guides and groups. It also puts the cursor to the right place to save time.
                        <GithubIssueLink issueNumber={40}/></li>
                    <li>Inventory items got a cleaner look with the border being the same color as the background</li>
                    <li>Fixed a bug where fully worn stickers would show as not worn at all <GithubIssueLink issueNumber={52}/></li>
                    <li>Fixed bookmarks not gettings saved because of chrome.storage.sync limits <GithubIssueLink issueNumber={51}/></li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.14 - 2019-05-19</h2>
                <ul>
                    <li>Fixed market listings script breaking on commodity items' pages <GithubIssueLink issueNumber={48}/></li>
                    <li>You can copy someone's profile permanent link to clipboard from the profile dropdown menu <GithubIssueLink issueNumber={15}/></li>
                    <li>Added option to load customizable (in the options menu) number of market listings on market pages <GithubIssueLink issueNumber={46}/></li>
                    <li>Added duplicate count to items on inventory (visible when item is in focus) <GithubIssueLink issueNumber={23}/></li>
                    <li>Added a reply icon to comments on profiles and groups that puts the name of the commenter in the text box like: <b>@GeRy | gery.dev</b>,
                        makes replying to comments more swift <GithubIssueLink issueNumber={40}/></li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.13.1 - 2019-05-12</h2>
                <ul>
                    <li>Moved issue tracking from TODO file to
                        <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension/issues'> Github issues</NewTabLink></li>
                    <li>Stickers are now visible on community market listings without user hovering </li>
                    <li>New logo, it's added to internal extension page navigation and pop-up too</li>
                    <li>Fixed item names in inventories always appearing in English.
                        <Credit to='https://steamcommunity.com/profiles/76561198291133191/'>B</Credit>
                        <GithubIssueLink issueNumber={5}/></li>
                    <li>Fixed "Don't Worry, I'm Pro" sticker breaking other stickers, if you encounter other stickers with commas in their name please let me know and I will apply the same fix
                        <GithubIssueLink issueNumber={7}/></li>
                    <li>Fixed Talon Sapphire showing up as "Unknown" <GithubIssueLink issueNumber={4}/></li>
                    <li>"New operation" scam comments are getting auto-reported</li>
                    <li>Fixed clicking inspect opening an unnecessary new tab
                        <Credit to='https://steamcommunity.com/profiles/76561198335126703'>Antiim8♛</Credit>
                        <GithubIssueLink issueNumber={3}/></li>
                    <li>Fixed non-worn stickers condition showing up as "NAN%" <GithubIssueLink issueNumber={6}/></li>
                    <li>Added an indication that an item was bookmarked when the user did not allow tabs api access to the extension
                        <GithubIssueLink issueNumber={2}/></li>
                    <li>Marking steamrep scammers' profile made optional <GithubIssueLink issueNumber={11}/></li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.13 - 2019-04-15</h2>
                <ul>
                    <li>Fixed "inspect in browser" not pointing to the correct link on market pages when steam inventory helper was set to load more than 10 items
                        <Credit to='https://steamcommunity.com/profiles/76561198261548996'>A.S.H</Credit>
                    </li>
                    <li>Fixed ruby knives and unknown dopplers' names not changing when selected in inventories
                        <Credit to='https://steamcommunity.com/profiles/76561198103971634'>Dᴊᴇɴᴛ</Credit>
                    </li>
                    <li>Added the phases for the new doppler knives (thanks so much for
                        <NewTabLink to='https://steamcommunity.com/profiles/76561198103971634'> Dᴊᴇɴᴛ </NewTabLink>
                        for collecting them)</li>
                    <li>Added further localization support (market pages)</li>
                    <li>Added partial Hungarian translation</li>
                    <li>Added partial Bulgarian translation (thanks
                        <NewTabLink to='https://steamcommunity.com/profiles/76561198900346137'> Flu0z </NewTabLink>
                        for being the first translator to volunteer</li>
                    <li>Stickers in inventories:</li>
                    <ul>
                        <li>Repositioned beside the weapon</li>
                        <li>Zoom on hover</li>
                        <li>Condition on hover</li>
                        <li>Click opens market page</li>
                    </ul>
                    <li>Fixed bugs in inventory pages in non-english language browsers</li>
                    <li>Fixed "other exteriors" not working in non-english language browsers</li>
                    <li>Added float bar and detailed technical float info to market pages</li>
                    <li>Repositions nametags in inventories (above weapon)</li>
                    <li>Repositioned default nametag icon so it does not cover the tradability indicator
                        <Credit to='https://steamcommunity.com/profiles/76561198013607021'>Oliver</Credit>
                    </li>
                    <li>Other minor bug fixes</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.12 - 2019-04-07</h2>
                <ul>
                    <li>Added basic support for internationalization  - if you are willing to help me translate the extension to other languages please contact me</li>
                    <li>Active inventory item is now highlighted when colorful inventory is enabled</li>
                    <li>Added StatTrak and Souvenir indicators to items - placed before exterior</li>
                    <li>Fixed "other exteriors" links not working on some items</li>
                    <li>Steamrep.com banned scammers are marked on their profile and in the trade window with by a different background and a warning ribbon on top</li>
                    <li>Users who uninstall the extension are now prompted to complete a survey on why they uninstalled - how it can be improved</li>
                    <li>Added csgolounge.com auto-bumping</li>
                    <li>Added CSGOTraders.net auto-bumping</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.11.1 - 2019-04-03</h2>
                <ul>
                    <li>Fixed a bug that caused doppler phases not to appear correctly on market listings</li>
                    <li>Made item coloring more robust</li>
                    <li>Fixed float indicator moving out of visible area on high float items
                        <Credit to='https://steamcommunity.com/profiles/76561198335126703'>Antiim8♛</Credit>
                    </li>
                    <li>Fixed unnecessary info appearing on non-csgo item
                        <Credit to='https://steamcommunity.com/profiles/76561198290209584'>hypoCHRIDT♛</Credit>
                    </li>
                    <li>Added more scam comment patterns for flagging</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.11 - 2019-04-01</h2>
                <ul>
                    <li>Added "Get Float Value" button to items in trade offers</li>
                    <li>When clicked item names open the items' market page in inventories</li>
                    <li>Added doppler phases to item names in inventories (instead of notes)</li>
                    <li>Fixed a bug that misplaced item exteriors on doppler knives</li>
                    <li>Items background and borders are now colored based on rarity or doppler phase</li>
                    <li>Performance improvements when changing inventory pages</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.10.1 - 2019-03-18</h2>
                <ul>
                    <li>Fixed a bug where some options were not editable</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.10 - 2019-03-17</h2>
                <ul>
                    <li>Fixed a bug where notes of doppler phases stayed behind on other items</li>
                    <li>Emoticon swastikas in profile comments are now flagged</li>
                    <li>Real chat status is shown on profiles - not just online, away, snooze, etc. (needs API key)</li>
                    <li>Float values are now visible in inventories (among other technical details)</li>
                    <li>Icons got a nice tooltip instead of the plain title</li>
                    <li>Use of chrome.tabs api made optional - it show a scary warning when the extension was installed. You can and should turn it on in the options for better user experience</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.9 - 2019-03-10</h2>
                <ul>
                    <li>You can now add your Steam API key in the option - needed for some future functions</li>
                    <li>Fixed bug where clicking on notifications would open multiple windows</li>
                    <li>The options page got a more refined look with:</li>
                    <ul>
                        <li>Flip switches instead of checkboxes</li>
                        <li>Editable text fields now pop up for better editing</li>
                        <li>Icons</li>
                    </ul>
                    <li>"Bookmark and notify" is out of preview with:</li>
                    <ul>
                        <li>Improved design</li>
                        <li>Notification options</li>
                        <li>Links to: the owner's profile, the item's market page, the owner's trade link</li>
                        <li>Icons</li>
                    </ul>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.8.2 - 2019-03-02</h2>
                <ul>
                    <li>Removed webRequest and webRequestBlocking permissions - should be rightfully less scary for new users</li>
                    <li>Fixed bug where loading private inventories would result in breakage</li>
                    <li>Added more scam comment patterns for flagging</li>
                    <li>"Bookmark and notify" improved styling, added link to item owner's profile</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.8.1 - 2019-02-25</h2>
                <ul>
                    <li>Some minor fixes discovered after 1.8.0 release</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.8.0 - 2019-02-25</h2>
                <ul>
                    <li>Added navigation to the internal sites</li>
                    <li>Added about page</li>
                    <li>Added "Bookmark and notify" page and function - in preview for now</li>
                    <li>Style changes</li>
                    <li>"Tradable after" dates are now more compact in inventories</li>
                    <li>Added more scam comment patterns for flagging</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.7.0 - 2019-02-18</h2>
                <ul>
                    <li>Added NSFW filter mode that blocks profile backgrounds, artwork and avatars - against anime boobs</li>
                    <li>Added "Reocc" button to your own profile</li>
                    <li>Fixed a bug where Market links of other exteriors would not work on Souvenir items</li>
                    <li>Added function that automatically flags scam comments on profiles</li>
                    <li>Applied a dark gray and orange style to the Options, Changelog an popup pages</li>
                    <li>Doppler phases are now visible on market pages</li>
                </ul>
            </Container>
            <Container className='buildingBlock'>
                <h2>Version 1.6.0 - 2019-02-10</h2>
                <ul>
                    <li>Added this changelog page</li>
                    <li>Users now receive notification when the extension updates</li>
                    <li>Added "+rep" button to profiles</li>
                    <li>Fixed a bug where users did not get their default options set when updating the extension</li>
                </ul>
            </Container>
        </Fragment>
    );
};

const GithubIssueLink = (props) => {
    return <NewTabLink to={'https://github.com/gergelyszabo94/csgo-trader-extension/issues/' + props.issueNumber}> #{props.issueNumber} </NewTabLink>
};

const Credit = (props) => {
    return <span> (thanks to <NewTabLink to={props.to}> {props.children} </NewTabLink> for reporting it) </span>
};

export default changelog;