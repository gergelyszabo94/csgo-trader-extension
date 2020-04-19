import React, {Fragment} from 'react';
import {Container} from 'react-bootstrap';

import Head from '../../components/Head/Head';
import NewTabLink from '../../components/NewTabLink/NewTabLink';
import ShowcaseImage from '../../components/ShowcaseImage/ShowcaseImage';

const releaseNotes = (props) => {
    props.gAnalytic.pageview(window.location.pathname + window.location.search);

    return  (
      <Fragment>
          <Head
            description='Release notes are meant to explain how to use new features and why certain design or policy decisions were made.'
            title='CSGO Trader - Release Notes'
            path={window.location.pathname}
          />

          <h1>Release-Notes</h1>
          <Container className='buildingBlock'>
              Release notes are meant to explain how to use new features and why certain design or policy decisions were made.
              They are published when a new version of the extension is submitted the distribution platforms.
              The platforms (Chrome Web Store, Mozzila Addons) review submissions before they are available for download.
              This means that the latest version might not have rolled out to your platform yet when you are reading this.
          </Container>
          <Container className='buildingBlock' id='2.2'>
              <h2>2.2 - Discussion bumping - security improvements</h2>
              <p>
                  After publishing the version before this I got the results of a code review form Mozilla.
                  They flagged some security issues that I spent most of the work addressing.
                  I did manage to include a simple, yet potentially powerful feature, let me show you what it is and how it works.
                  If you are someone who advertises trades in Steam groups or on the trading forum this is for you!
                  You might have seen people who keep commenting under their own posts to make it appear before others' or you might have done it yourself manually.
                  You don't have to anymore! CSGOTrader adds a checkbox to discussion pages that if you check your problem is solved!
                  The extension will keep posting new bumping comments under these posts for you every 30 minutes while removing older ones.
                  All you have to do is to keep the page that you want this to happen on open.
                  On the screenshot below you can see the checkbox mentioned above.
                  Also notice the deleted comment and the new bumping comment, all done automatically!
                  And don't worry, others don't see you removed comments, only the last one!
              </p>
              <ShowcaseImage src='/img/release-notes/discussion_autobumping.png' title='Autobumping example screenshot'/>
              <p>
                  I hope you like it and as usual, let me know if you find any problems with it!
              </p>
          </Container>
          <Container className='buildingBlock' id='2.1'>
              <h2>2.1 - Friend request evaluation, items present in other offers indicated</h2>
              <div className="text-danger">
                  There was a bug identified in this update that causes features to break.
                  If you are facing issues and are still on this version you can work around it:
                  Make sure you have your Steam API key set in the options the  go to your inventory, click "Trade offers".
                  This opens the incoming trade offers page and the extension updates the active offer information, fixing the problem.
              </div>
              <p>
                  Two new features, several bug fixes and smaller improvements were made in this update.
                  It's easier to show the changes in a video format so I made one of those too this time:
              </p>
              <div className='video-container'>
                  <iframe
                    width='560'
                    height='315'
                    src='https://www.youtube.com/embed/XeXiAItf5s4'
                    frameBorder='0'
                    allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
                    title='CSGO Trader Updated 2.1 Release Notes'
                    allowFullScreen>
                  </iframe>
              </div>
              <br />
              <p>
                  The feature I put a lot of work in is what I call "Friend request evaluation automation".
                  You can find it in the options under "Friends, Groups and Invites".
                  This is personally a huge help and time saver for me so I am very happy that it's out now.
                  I have been testing it on my account the past week or so and it probably saved me hours of work already.
                  I personally get around 100 friend requests a day.
                  If I were to talk to everyone who adds me than that would be the only thing I ever do.
                  This is why I have to limit who I accept to my friend list and allocate time to talk to.
                  I trade for profit so I have been trying to accept people who are good prospects.
                  I set certain rules who I accept to make my life easier.
                  I was using these rules manually up to this point, but now my extension does it for me automatically.
                  I have the above rules set myself:
              </p>
              <ShowcaseImage src='/img/release-notes/invite_rules.png' title='The rules I have set.'/>
              <p>
                  There are a bunch of conditions and 3 actions so plenty of combinations to play with, be creative!
              </p>
              <p>
                  You can check your friend request history and what actions the extension has taken if any for the last week.
                  Here is a snippet of mine:
              </p>
              <ShowcaseImage src='/img/release-notes/request_history.png' title='My friend request history'/>
              <p>
                  The list of incoming friend requests is also available with detailed information about each user.
              </p>
              <ShowcaseImage src='/img/release-notes/incoming_requests_table.png' title='My incoming friend requests'/>
              <p>
                  The other major new feature is to be able to see if an items is present in other offers (in case of trade offers).
                  Or if it is in any offers (indicated in inventories).
                  Here is how it looks in practice. The M9 in question has an indicator as it is present in two other offers.
                  Clicking that indicator adds links to the other offers.
              </p>
              <ShowcaseImage src='/img/release-notes/in_offer_indicator.png' title='Item in-offer indicator'/>
          </Container>
          <Container className='buildingBlock' id='2.0'>
              <h2>2.0 - UI Refresh, Project Restructure</h2>
              <p>
                  The major version bump might be a bit misleading since there were no significant new features added this time.
                  The Popup, Options and Bookmarks pages were rewritten in React and thw whole project was modernized (now using modules, webpack, linting, etc.).
                  Hopefully all this work will allow us to implement new features more quickly in the future.
                  Enough of the technical crap, let me show you some of the new things!
                  The small calculator included in the extension popup should now be easier to use.
              </p>
              <ShowcaseImage src='/img/release-notes/popup_calculator.png' title='New extension popup calculator'/>
              <p>
                  The options page was tidied up and broken up into categories instead of a single long scrolling page:
              </p>
              <ShowcaseImage src='/img/release-notes/options_subnav.png' title='New categorized options menu'/>
              <p>
                  Bookmarks became cards:
              </p>
              <ShowcaseImage src='/img/release-notes/bookmarks.png' title='Bookmark cards'/>
          </Container>
          <Container className='buildingBlock' id='1.26'>
              <h2>1.26 - Sticker Prices</h2>
              <p>This update focused on delivering applied sticker prices to inventory and offer items as well as market listings.
                  Let me emphasize that these prices are not meant to be "the item is this much more expensive now", it's purely the total price of the stickers displayed.
                  A few things to note on this screenshot: The total sticker prices per item shown under the exterior in small white print.
                  The Sorting Method selected is "Sticker price (expensive to cheap) and the items are in that order.
                  The mouse pointer is hovering over the "Winged Defuser" sticker, the tooltip shows the sticker's price.
              </p>
              <ShowcaseImage src='/img/release-notes/sticker_prices_inventory.png' title='Inventory Sticker Prices and Sorting by sticker prices'/>
              <p>
                  The same features are available in trade offers and on the incoming  tradeoffers page as wel.
                  If, for some reason you don't like this feature you can disable it by going to the options and flipping the switch on "Show sticker worth on items".
              </p>
              <p>
                  On the market pages, you can sort the listings by sticker price, you can see the total price of stickers on an item and see the individual stickers' prices when hovering over them:
              </p>
              <ShowcaseImage src='/img/release-notes/sticker_prices_market.png' title='Market Sticker Prices and Sorting by sticker prices'/>
          </Container>
          <Container className='buildingBlock' id='1.25'>
              <h2>1.25 - New Community Market homepage features, price highlighting, market history export</h2>
              <p>This update brought to some nice new features to the
                  <NewTabLink to='https://steamcommunity.com/market/'> Steam Community Market </NewTabLink> homepage.
                  Market lowest listing prices or "starting at" prices are loaded for every market listing and are highlighted
                  in green if your listing has the same price as the lowest or in red if they do not.
                  Mind you, your listing having the same price as the lowest listing does not always mean that your listing is the first one in the list on the market!
                  An additional column with checkboxes was added to the listings table.
                  You can select the listings you want removed then click the header to remove them.
                  The total price of the listings on the current page is also added to the bottom.
                  You can see these illustrated here:
              </p>
              <ShowcaseImage src='/img/release-notes/market_listings_features.png' title='Community Market Listings Features'/>
              <p>
                  Similarly, totals, cancel all and cancel selected functionality was added to buy order section as well.
                  The price loaded here is not the lowest listing though, but the highest buy order's price.
                  The highlighting also works the other way around, if your buy order is the highest it is marked with green.
                  Otherwise it's red.
              </p>
              <ShowcaseImage src='/img/release-notes/buy_order_features.png' title='Buy order features'/>
              <p>
                  You might have noticed a new tab appearing on the market main page besides your listings and history tabs.
                  An "Export Market History" tab was added. I described its purpose there but I will paste it here too:
                  "Exporting your market history can be great if you want to analyse it in a spreadsheet for example.
                  A history event is either one of these four actions: a purchase, a sale, a listing creation or a listing cancellation.
                  The result is a .csv file that you can open in Microsoft Excel or use programmatically.
                  It is in utf-8 charset, if you see weird characters in your Excel you should try
                  <NewTabLink to='https://www.itg.ias.edu/content/how-import-csv-file-uses-utf-8-character-encoding-0'> importing it as such.</NewTabLink>
                  ".
                  The extension requests your market history in batches of 50 events and with a 5 second delay between each request.
                  I am definitely not the average Joe with my over a hundred thousand events, gathering my whole market history would take close to 3 hours.
                  This is what the feature looks like in action, not particularly exciting, but wait for the result!
              </p>
              <ShowcaseImage src='/img/release-notes/market_history_export_inprogress.png' title='Market History Export in-action'/>
              <p>
                  Here are a few rows of what the result looks like:
              </p>
              <ShowcaseImage src='/img/release-notes/market_history_export_result.png' title='Market History Export result'/>
          </Container>
          <Container className='buildingBlock' id='1.24'>
              <h2>1.24 - Highlighted profiles, trade offer Widescreen goodness</h2>
              <p>Along with many bug fixes and other improvements this update brought two small features.</p>
              <p>Profiles with "csgotrader.app" in their name are highlighted with golden coloring.
                  Similarly to holiday profiles it makes profiles stand out. It's applied on profiles, comments, friend lists, group member lists.
                  I though I would give a little incentive to anyone nice enough to want to spread the word about the extension.
                  Illustration:
              </p>
              <ShowcaseImage src='/img/release-notes/highlighted_profile.jpg' title='Golden highlighted profile'/>
              <p>
                  The other feature is being able to move trade offer headers to the left on Widescreens.
                  It's on by default, it should activate for most people if they have offers open full screen.
                  If you don't like this feature you can head over to the extension options and look for "Offer header to left" and turn it off.
                  Illustration:
              </p>
              <ShowcaseImage src='/img/release-notes/trade_offer_header_left.jpg' title='Trade offer header on the left'/>
          </Container>
          <Container className='buildingBlock' id='1.23'>
              <h2>1.23 - Partner offer history summary</h2>
              <p>It might not be immediately obvious from the title of what this feature does, so let me explain and illustrate it first before going into the details.
                  Knowing how many offers a user sent you or you sent them as well as when those last happened it a valuable information for people doing trades.
                  This feature put's these snippets of ino to the Incoming Trade Offers, individual trade offer, inventory and profile pages.
              </p>
              <p>On the Incoming Trade Offers page each offer is populated with this info under each party's item like:</p>
              <ShowcaseImage src='/img/release-notes/incomming_offers_history.jpg' title='Incoming Offers partner offer history summary'/>

              <p>In every trade offer page it is visible as an info card:</p>
              <ShowcaseImage src='/img/release-notes/trade_offer_history.jpg' title='Trade offers partner offer history summary'/>
              <p>In inventories it's shown under the user's name and above the item inventories:</p>
              <ShowcaseImage src='/img/release-notes/inventory_offer_history.jpg' title='Inventories partner offer history summary'/>
              <p>To check it on profiles you have to open the context menu and click 'Show Offer History':</p>
              <ShowcaseImage src='/img/release-notes/profile_hover_history.jpg' title='Profile context menu hover partner offer history summary'/>
              <p>The information will be displayed on their profile after this':</p>
              <ShowcaseImage src='/img/release-notes/profile_offer_history.jpg' title='Profile partner offer history summary'/>
              <p>
                  The feature uses the Steam API to get the offer history information.
                  For it to work you need to go to the option and set you API key or
                  <NewTabLink to='https://steamcommunity.com/dev/apikey'> click here to have it set automatically by the extension </NewTabLink>
                  (have the extension installed and be logged into Steam).
                  As of the writing this information is updated wherever you open the Incoming Offers Page.
                  Steam only stores the last 1000 incoming and last 500 sent offers, so the numbers you see are based on that.
                  The extension stores this data however which means that those that were visible on the first run and any after that will be accounted for in the future.
                  You can turn this feature off by going to the extension options and toggling 'Show partner history'.
                  Any questions, concerns about the feature please email
                  <NewTabLink to='mailto:support@csgotrader.app'> support@csgotrader.app</NewTabLink>.
              </p>
          </Container>
          <Container className='buildingBlock' id='1.22'>
              <h2>1.22 - Market Mass Selling (BETA)</h2>
              <p>Market Mass Selling has been one of the most requested feature for the extension since its release.
                  It's also what kept me from removing Steam Inventory Helper completely (I enabled it sometimes when
                  I wanted to list many items).
                  I am glad to announce that the feature is now in Beta.
                  Switching currencies back and forth does not seem something that Steam takes lightly so I was not
                  able to test the feature with currencies other than Euros.
                  This is mostly the reason that it's still in Beta. While using please double check the prices when
                  you are confirming them on your phone.
                  If you find any bugs or strange behavior please describe it in a mail to
                  <NewTabLink to='mailto:support@csgotrader.app'> support@csgotrader.app</NewTabLink>.
              </p>
              <p>Click the hand icon in your inventory to start selecting items that you want to sell.
                  Holding down the control key while selecting an item will also select all similar items.
                  Once you have the items you want to sell in the list specify a price for it. You have four
                  options:</p>
              <ul>
                  <li>Extension price - The price provided by the extension (from the pricing provider you have
                      selected)
                  </li>
                  <li>Starting at - The price of the current lowest listing on the market at the moment</li>
                  <li>Quick sell - The price that will make your item the cheapest listing on the market if you use
                      it. Just a bit below Starting at
                  </li>
                  <li>Your price - Specify your own price that you want the item(s) listed at</li>
              </ul>
              <p>Click "Start Mass Listing" to initiate the selling process</p>
              <ShowcaseImage src='/img/release-notes/mass_sell_start.jpg' title='Start the Mass Selling Process'/>
              <p>Note: You might have your extension's price set to a different currency than your Steam Wallet
                  currency. If that is the case you will receive this warning message.
                  Clicking 'Click here to fix this' will change your extension price to the same as your Steam
                  Wallet price and reload the page.</p>
              <ShowcaseImage src='/img/release-notes/mass_listing_warning.jpg' title='Mass Listing currency mismatch warning'/>
              <p>You will be able to see the progress by the quantities decreasing, lines getting stricken
                  through and items becoming greyed out.</p>
              <ShowcaseImage src='/img/release-notes/mass_listing_in_progress.jpg' title='Start the Mass Selling In Progress'/>
          </Container>
          <Container className='buildingBlock' id='1.20'>
              <h2>1.20 - Incoming trade offers features</h2>
              <p>I have worked quite a bit on this and I think it ended up pretty nice and useful so I want as many
                  people to use it as possible.
                  Unfortunately to do so you have to add your Steam API key in the options first.
                  I tried solving this without that but it's not really possible to do so while offering appropriate
                  user experience.
                  If you don't have your API key set then all you will notice is a note on top of the trade offers
                  page advising to add your API key and linking to this page.</p>
              <p>These are the features that you are missing if you don't have it set:</p>
              <ul>
                  <li>Incoming offers summary showing the number of profitable offers and potential profit</li>
                  <li>Option to sort by profit, loss, received time, etc.</li>
                  <li>Prices, total per side, profit or loss per trade shown</li>
                  <li>Exteriors, doppler phases, colors, etc.</li>
                  <li>Float values in case they were loaded for those items previously</li>
              </ul>
              Illustrated in the bellow screenshot:
              <ShowcaseImage src='/img/release-notes/incomingoffersfeaturesfull_annotated.jpg' title='Incoming offers features'/>
          </Container>
      </Fragment>
    );
};

export default releaseNotes;