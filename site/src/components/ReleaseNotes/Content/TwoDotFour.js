import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const TwoDotFour = () => {
  return  (
    <ReleaseNote
      version="2.4"
      title="RealTime pricing, mass listing support for other games"
      video="https://www.youtube.com/embed/KnEHfG8W2kE"
    >
      <p>
        There is a new major feature that I want to show you. It's RealTime pricing time!
        Many of you have asked for this feature and now here it is!
        In the Pricing menu of the extension options you can find three new options.
        The Realtime pricing mode option is set to "Ask price" by default,
        since I think that is what most people would expect to be seeing when current market price is mentioned.
        I myself use the "Mid price" mode to get some conservative pricing on items.
        You probably don't want to tinker with the other two but I gave you the option.
      </p>
      <ShowcaseImage src='/img/release-notes/realtime_pricing_options.png' title='RealTime pricing options'/>
      <p>
        On the incoming offers page you will see a "Load Prices" button that starts loading the RealTIme prices for that offer.
        The individual prices appear in yellow once loaded and the totals are updated.
      </p>
      <ShowcaseImage src='/img/release-notes/realtime_pricing__incoming_offers.png' title='RealTime pricing incoming offers example'/>
      <p>
        It works similarly in trade offers and inventories, although there is no button there, it happens automatically or not at all.
        You can find the "Load RealTime prices" options under the trade offer and inventory options to control this behaviour.
        To limit requests to Steam, only one page is allowed to load prices at the time.
      </p>
      <p>
        Mass listing has support for other games too now:
      </p>
      <ShowcaseImage src='/img/release-notes/mass_listing_tf2.png' title='Inventory mass listing for other games'/>
      <p>
        As always, if you find any problems with the new code, do let me know!
      </p>
    </ReleaseNote>
  );
};

export default TwoDotFour;