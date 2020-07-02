import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';
import NewTabLink from '../../NewTabLink/NewTabLink';

const OneDotTwentyTwo = () => {
  return  (
    <ReleaseNote
      version="1.22"
      title="Market Mass Selling (BETA)"
    >
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
    </ReleaseNote>
  );
};

export default OneDotTwentyTwo;