import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';

const TwoDotTen = () => {
  return  (
    <ReleaseNote
      version="2.10"
      title="Discord notification, Buff links and Offer history (BETA)"
    >
      <br />
      <h3>Discord notification for Trade Offer Automation</h3>
      <p>
        With Trade Offer Automation you were already able to setup rules that notify you about certain incoming offers but these notification were desktop only.
        I added Discord notification as an action for Trade Automation so we can setup rules and be notified even when we are AFK.
        Here is how you can set it up with your Discord, you will of course need the version 2.10 or higher of the extension installed and a Discord account as a prerequisite.
        <ul>
          <li>
            Go the Notifications menu under Options and toggle "Allow Discord notifications".
            The extension will ask you to give it permission to access Discord's servers. Allow it.
            <ShowcaseImage src='/img/release-notes/allow_discord_notification.png' title='Allow Discord notification'/>
            Leave this page open, you will need it in a minute.
          </li>
          <li>
            Open Discord and create your own server if you don't have one already.
          </li>
          <li>
            Under your server create a channel where you want to receive notification.
          </li>
          <li>
            Click the gear icon by your channel and go to the Integrations submenu.
          </li>
          <li>
            Click "Create Webhook".
          </li>
          <li>
            Give it a name and copy the Webhook URL.
            <ShowcaseImage src='/img/release-notes/discord_copy_webhook.png' title='Discord copy webhook'/>
          </li>
          <li>
            Go back to the extension's Notifications options and submit your Webhook URL.
            <ShowcaseImage src='/img/release-notes/discord_submit_webhook.png' title='Discord submit webhook'/>
          </li>
          <li>
            You can now setup your automation rules and receive notifications like this.
            <ShowcaseImage src='/img/release-notes/discord_notification_example.png' title='Discord notification example'/>
          </li>
        </ul>
        <br />
      </p>
      <h3>Buff links</h3>
      <p>
        If you want a quick and easy way to find lookup item on Buff like this you can enable this option under in Options/Inventory.
        <ShowcaseImage src='/img/release-notes/inventory_buff_link.png' title='Inventory Buff link'/>
        A similar link will appear automatically in trade offers.
        <ShowcaseImage src='/img/release-notes/trade_offer_buff_link.png' title='Offer Buff link'/>
      </p>
      <h3>Trade Offer History</h3>
      <p>
        I got a little pissed when I was not able to load my offer history for days after the operation came out so I took it upon myself to recreate the Incoming and Sent offers history pages.
        After a while I realized that the Steam API returns partial data so it's kind of half-baked for now, but it's out in BETA.
        <ShowcaseImage src='/img/release-notes/incoming_offer_history.png' title='Incoming Offer History (BETA)'/>
      </p>
    </ReleaseNote>
  );
};

export default TwoDotTen;