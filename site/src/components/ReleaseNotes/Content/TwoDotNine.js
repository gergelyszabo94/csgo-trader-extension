import React from 'react';
import ReleaseNote from '../ReleaseNote'
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotNine = () => {
  return  (
    <ReleaseNote
      version="2.9"
      title="Trade offer auto-send, new in-browser inspect / screenshotting service"
    >
      <br />
      <h3>Inspecting</h3>
      <p>
        I created the first version of the extension now over 18 months party so I would not have to copy paste inspect links into CS.DEAL's csgo.gallery in-browser inspecting service.
        That service however has not been operational for several months and now a competing, actually functional service popped up.
        A <NewTabLink to="https://market.swap.gg/screenshot" >tool by SWAP.GG</NewTabLink> works the same way as csgo.gallery and before that metjm did.
        The "In-browser inspect" buttons added by the extension to inventories, trade offers and market pages now all point to this service.
      </p>
      <h3>Auto-offer sending</h3>
      <p>
        As Peer-to-peer trading is becoming more prevalent users often find themselves sending items to/from others that bought or sold them.
        The extension now includes a new option that is off by default (to protect users).
        It's under "Trade Offer Automation" and called "Send offers based on query params".
        When it's on the extension will check the query parameters and sends the offer accordingly.
        If sites start to use it by including them in the trade links they provide it allows for auto-delivery.
        For now it's mostly useful mostly for tinkerers like myself.
        There are two query parameters that determine what offer to send will look like, csgotrader_send and csgotrader_message.
        csgotrader_send's parameters are divided by underscores and use the following format:
        <ul>
          <li>The first parameter is whether the item to send is owned by the sender or the receiver, with possible values of your and their</li>
          <li>
            The second parameter is format type, how the item is identified.
            It's either id or name. It's important to understand the distinction.
            When it's set to name the extension will send the first item with that name since market names don't uniquely identify an item.
            This can lead to an item with a different float/pattern being sent than what the user my expect.
            When it's set to id it can properly identify the instance to send by asset id (fifth parameter).
          </li>
          <li>
            The third parameter is the Steam App ID of the game the item belongs to.
          </li>
          <li>
            The forth parameter is the inventory context id that the item belongs to (almost always 2).
          </li>
          <li>
            The fifth parameter is the name or id.
            Depending on the second parameter it should either be an asset id or a market hash name.
          </li>
        </ul>
        <br />
        <p>
          The extension will also include a message with the offer if the csgotrader_message query parameter is present.
          Here is a practical example, here is my trade link with query parameters set in a way that if you
          have the extension install with this new option on and you own an Ak Redline and you open it it will be sent to me.
          <NewTabLink to="https://steamcommunity.com/tradeoffer/new/?partner=75764727&token=tx0asz7q&csgotrader_send=your_name_730_2_AK-47%20|%20Redline%20(Field-Tested)&csgotrader_message=Example%20offer%20sent%20from%20the%20Release%20Notes" >
            https://steamcommunity.com/tradeoffer/new/?partner=75764727&token=tx0asz7q&csgotrader_send=your_name_730_2_AK-47%20|%20Redline%20(Field-Tested)&csgotrader_message=Example%20offer%20sent%20from%20the%20Release%20Notes
          </NewTabLink>
        </p>
        <p>
          I don't recommend anyone to have this option on if they have auto mobile confirmation setup and I caution against using the name option unless there is no way of knowing the item's asset id.
        </p>
      </p>
    </ReleaseNote>
  );
};

export default TwoDotNine;