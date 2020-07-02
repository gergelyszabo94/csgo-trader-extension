import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';
import NewTabLink from '../../NewTabLink/NewTabLink';

const OneDotTwentyThree = () => {
  return  (
    <ReleaseNote
      version="1.23"
      title="Partner offer history summary"
    >
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
    </ReleaseNote>
  );
};

export default OneDotTwentyThree;