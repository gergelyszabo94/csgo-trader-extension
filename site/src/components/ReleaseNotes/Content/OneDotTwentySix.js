import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const OneDotTwentySix = () => {
  return  (
    <ReleaseNote
      version="1.26"
      title="Sticker Prices"
    >
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
    </ReleaseNote>
  );
};

export default OneDotTwentySix;