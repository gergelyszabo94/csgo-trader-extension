import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const TwoDotSeven = () => {
  return  (
    <ReleaseNote
      version="2.7"
      title="Trade Offer Automation (BETA)"
      video="https://www.youtube.com/embed/unHrSBMaHRg"
    >
      <p>
        There were several small features, tweaks and fixed introduced in this update along with a new "big" feature, Trade Offer Automation.
        Let me start by talking about that one then showing you the other things.
        If you go to the extension options now you should see a new category called "Trade Offer Automation".
        You will have the monitoring of incoming offers off by default. If you want to use this feature toggle it on.
        Don't forget to set your Steam API key though if you haven't, because this feature won't work without that.
      </p>
      <ShowcaseImage src='/img/release-notes/trade_offer_automation_beta.png' title='Trade Offer Automation (BETA)'/>
      <p>
        I added the same rules that I use right now as defaults, they are inactive for you though.
        What each rule does:
        <ol>
          <li>
            Accepts "gift offers" (where there is nothing added from my inventory) and the sender did not include a message with the offer
          </li>
          <li>
            Notifies me if the offer includes profit of 5 (EUR in my case, it will be your currency for you) or more
          </li>
          <li>
            Notifies me if the offer includes 10% or more overpay
          </li>
          <li>
            Declines the offer if the other party did not include anything from their side nor included a message
          </li>
          <li>
            Declined the offer if the other party did not include anything from their side and the message they added includes the word "please"
          </li>
        </ol>
        The rules are evaluated in order and only the first matching rule's action is executed.
        These events are logged to the offer event history (right).
        There is a security rule by Steam that makes it so that offers can only be accepted from a web request originating from a Steam page.
        To work around this I wrote logic that checks for the presence of active Steam tabs.
        If you have any when the accepting is triggered the accepting code snippet is injected to that tab.
        If you don't, the extension opens the offer in a new tab, accepts it then closes the tab.
        To make this all work you have to grant the extension "browser.tabs" permission. You can do so by navigating to the General options.
        The tabs api is powerful and comes with a scary warning about browser history.
        I know that this reads bad but the alternative would be rewriting request headers with the webrequest api, which is even more powerful
        (grants access to all browser communication).
        Again, the tabs api is only used the check for existing Steam tabs, to inject the accept code and to open new tabs.
        No browser history is read by the extension. If you don't want to use the accept action you can go without granting the extension tabs api access.
      </p>
      <ShowcaseImage src='/img/release-notes/trade_offer_add_rule.png' title='Add a new Trade Offer rule'/>
      <p>
      You have the conditions listed above to work with, you can combine them with the AND and OR operators and choose to apply either the accept, notify or decline actions.
      I already have some ideas for more conditions and actions but I wanted this out so it can be tested and used by more people!
      </p>
      <p>
        I added a "show all" button to market listings that loads more buy and sell orders then what is displayed by Steam.
      </p>
      <ShowcaseImage src='/img/release-notes/market_listings_show_all.png' title='Show all offers button on market listings'/>
      <p>
        Also added a feature that highlights individual market listings that you have seen before in purple color.
        This way you can skip items you have already seen when looking for something specific, like a stickered item.
      </p>
      <ShowcaseImage src='/img/release-notes/market_listings_highlighted.png' title='Highlighted market listings'/>
      <p>
        If you have the option to report spam comments turned on then you are also getting those moderation messages every day in the middle of the night.
        I added an option to automatically mark those read so you don't have to do it yourself each time. You can find this option under the new "Safety" options category.
      </p>
      <p>
        You can also set your own default values to appear in the extension popup calculator.
      </p>
      <ShowcaseImage src='/img/release-notes/options_default_popup_values.png' title='Options, default popup values'/>
      <p>
        There were several bugs fixed as well which you can read about in the changelogs.
      </p>
    </ReleaseNote>
  );
};

export default TwoDotSeven;