import React from 'react';
import ReleaseNote from '../ReleaseNote'
import ShowcaseImage from '../../ShowcaseImage/ShowcaseImage';
import NewTabLink from '../../NewTabLink/NewTabLink';

const TwoDotThree = () => {
  return  (
    <ReleaseNote
      version="2.3"
      title="Mass selling, trading, friend requests improvements and more"
      video="https://www.youtube.com/embed/kgWkpjm4uhs"
    >
      <p>
        Version 2.1 brought us friend requests and their evaluations.
        It's now out of beta after some fine tuning and additional features.
        There is an option to turn monitoring off.
        If you have the extension installed in multiple browsers or computers you should probably leave it on in one of them to avoid unnecessary requests to Steam.
        I added four new conditions for you, you now set rules based on the users' username, the country they are from or if they had sent a request recently.
        You can also set a rule to match to everyone by using "All users". For example if you don't want to accept any invites.
        There is also a summary of the past 24 hour's events.
      </p>
      <ShowcaseImage src='/img/release-notes/friend_requests.png' title='Friends, groups and invites'/>
      <p>
        In the incoming friend requests table you can see how many invites there are.
        You can copy the users' name to clipboard and open their inventory by clicking their inventory value.
      </p>
      <ShowcaseImage src='/img/release-notes/invites_table.png' title='New invites table'/>
      <p>
        The Market Mass Listing feature also received some new features.
        Once you select an item and it appears in the table, you can edit the quantity field to sell a specific number of that item.
        I imagine it's useful for people selling lots of cases for example.
        You select all items on the current page with a button press and select all items a set value that you specify.
        There is an option to start listing the items once all prices have loaded.
        You can also easily check the progress of the listings or stop it.
        Mass listing will keep retrying to list the items if it runs into errors (for example Steam is having problems).
      </p>
      <ShowcaseImage src='/img/release-notes/mass_listings_improvements.png' title='Mass Listing improvements'/>
      <p>
        Next on the list is improvements to trade offers.
        On the incoming offers page you can now see if a user has sent you a friend request.
        Useful if you want to accept them for some discussion or they send a bad offer and you would just rather ignore them.
        The profit/loss number was moved to the top right corner of the offer.
        Profitable offers show in green, offers with loss are marked with red.
      </p>
      <ShowcaseImage src='/img/release-notes/you_have_incoming_invite.png' title='You have an incoming friend request from the user, profit/loss moved'/>
      <p>
        On opened offers, there is an offer summary section now.
        It shows profit/loss and an all around summary of the trade.
        On the screenshot below notice the "Decline Trade" button showing up yet the offer is being modified.
        This means that you can now decline offers even after you started modifying them.
      </p>
      <ShowcaseImage src='/img/release-notes/offer_summary.png' title='Trade offer summary'/>
      <p>
        I have partnered with  <NewTabLink to='https://skincay.com/?r=gery'> Skincay.com </NewTabLink>.
        I added them as a pricing provider inside the extension as well as placed links to their marketplace on market listing pages.
        These are affiliate links and if you use them when you sign up to the site you will support the development of the extension.
        I hope it is not too intrusive, but if it bothers you then you can go to the options and set it to not show for you.
      </p>
    </ReleaseNote>
  );
};

export default TwoDotThree;