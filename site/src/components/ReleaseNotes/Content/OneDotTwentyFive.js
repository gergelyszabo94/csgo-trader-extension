import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';
import NewTabLink from '../../NewTabLink/NewTabLink';

const OneDotTwentyFive = () => {
  return  (
    <ReleaseNote
      version="1.25"
      title="New Community Market homepage features, price highlighting, market history export"
    >
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
    </ReleaseNote>
  );
};

export default OneDotTwentyFive;