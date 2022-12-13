import React, {Fragment} from 'react';
import { Container } from 'react-bootstrap';

import Head from '../../components/Head/Head';
import NewTabLink from '../../components/NewTabLink/NewTabLink';
import ShowcaseImage from '../../components/ShowcaseImage/ShowcaseImage';

import './Home.css';
import {Link} from "react-router-dom";

const home = (props) => {
  props.gAnalytic.pageview(window.location.pathname + window.location.search);

  return  (
    <Fragment>
      <Head
        description='CSGO Trader - Steam Trading Enhancer Extension for Chrome and Firefox that is designed to help with CS:GO trading.'
        title='CSGO Trader - Steam Trading Enhancer Extension'
        path={window.location.pathname}
      />

      <h1>About CSGO Trader Extension</h1>

      <Container className='buildingBlock'>
        <p>
          CSGO Trader is an <NewTabLink to='https://github.com/gergelyszabo94/csgo-trader-extension'>open source </NewTabLink>
          browser extension for Chrome and Firefox that is designed to help with CS:GO trading.
          I started by adding functionality that Steam Inventory Helper lacked, but it already has SIH's most important features and much more.
        </p>
        <h2>An incomplete list of current features:</h2>
        <ul>
          {
            featureList.map((feature, index) => {
              return <li key={index}>{feature}</li>
            })
          }
        </ul>
        <p>
          I started publishing release notes for the extension updates that include illustrations,
          if you want more screenshots and descriptions of the features, visit the
          <Link to='/release-notes/'> Release-Notes </Link> page.
        </p>
      </Container>

      <Container className='buildingBlock'>
        <h2>Install</h2>
        <p>
          The extension is available in the
          <NewTabLink to='https://chrome.google.com/webstore/detail/csgo-trader/kaibcgikagnkfgjnibflebpldakfhfih/'> Chrome Web Store </NewTabLink>
          at
          <NewTabLink to='https://microsoftedge.microsoft.com/addons/detail/emcdnkamomgiafjejbhdpcfgbeeimpdb'> Microsoft Edge Addons </NewTabLink>
          and at
          <NewTabLink to='https://addons.mozilla.org/en-US/firefox/addon/csgo-trader-steam-trading/'> AMO</NewTabLink>
          . These release versions are usually updated every 1-2 weeks.
          If you have a browser that is not Chrome or Firefox don't worry, not all is lost.
          If you have a Chromium based browser like Opera, Ungoogled Chromium or Brave you should be able to install the Chrome version.
          I have even heard about a guy getting it to work on Android with Yandex browser, but I haven't tried it myself and I can't guarantee that it won't be buggy if it works at all like that.
          If you are on Safari, all is lost for you because I have no plan of porting it for your browser, Safari extensions work very differently and the work can't be justified.
        </p>
        Get it from your browser's marketplace:
        <p align='center'>
          <PlatformIcon
            link='https://chrome.google.com/webstore/detail/csgo-trader/kaibcgikagnkfgjnibflebpldakfhfih/'
            img='/img/chrome.png'
            title='Get it for Chrome from Chrome Web Store'
          />
          <PlatformIcon
            link='https://addons.mozilla.org/en-US/firefox/addon/csgo-trader-steam-trading/'
            img='/img/firefox.png'
            title='Add it to your Firefox through Firefox Add-ons'
          />
          <PlatformIcon
            link='https://microsoftedge.microsoft.com/addons/detail/emcdnkamomgiafjejbhdpcfgbeeimpdb'
            img='/img/edge.svg'
            title='Get it from Microsoft Edge Addons'
          />
        </p>
      </Container>

      <h2 align='center'>Feature Showcase</h2>

      <Container>
        <div className='video-container'>
          <iframe
            width='560'
            height='315'
            src='https://www.youtube.com/embed/6OOGxAlc8O8'
            frameBorder='0'
            allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
            title='CSGO Trader - Steam Trading Enhancer Extension - Feature Showcase'
            allowFullScreen>
          </iframe>
        </div>
        {
          featureShowcase.map(showcase => {
            return  (
              <Container key={showcase.imgSrc}>
                <h3>{showcase.title}</h3>
                <ShowcaseImage src={showcase.imgSrc} title={showcase.title}/>
              </Container>
            );
          })
        }
        <Container className='center'>
          Showcase images created by <a href="https://steamcommunity.com/profiles/76561198273736958">Janissary</a>, thank you!
        </Container>
      </Container>
    </Fragment>
  );
};

const PlatformIcon = ({ link, img, title }) => {
  return (
    <NewTabLink to={link}>
      <img src={img} width="128" title={title} alt={title} className='platformIcon'/>
    </NewTabLink>
  );
};

const featureList = [
  'Pricing info in inventories and trade offers',
  'Total inventory value, trade offer value',
  'Show profit for incoming trade offers, order by most profitable first',
  '"Inspect in Browser..." button on market, inventories and trade offers',
  'Item mass listing/selling',
  'Shows when an item\'s trade lock will expire and adds a countdown',
  'Shows floats and other technical info like paint index, paint seed, pattern index in inventories, offers and on the market',
  'Order by float value on market pages, show more than the default 10 listings on the market',
  'Doppler phases, fade percentages, marble fade patterns (fire and ice, blue tip, red tip, etc.)',
  'Shows exterior on each item and adds links to other version to inventory and market pages',
  'NSFW filter mode to avoid showing anime boobs to your colleagues',
  'Bookmark an item and get a notification when it is ready to trade',
  'Real chat status on profiles (away, busy, snooze instead of just online)',
  'Colorful inventories, changes each items\' background based on its rarity',
  'Scammers are market on their profile and in trade offers (if they are SteamRep banned)',
  'CSGOLounge.com auto-bumping, make your trades more popular by keeping them on top',
  'CSGOTraders.net auto-bumping, make your trades more popular by keeping them on top',
  'Add or remove similar items from a trade, add whole page, add all similar items',
  'Pricing providers: CSGO Trader, Steam, CS.MONEY, Bitskins, LOOT.FARM, CSGO.TM',
  'See the original currency and price an item was listed on the market',
  '"Starting at" price info and sales volume info in everyone]\'s inventory',
  'Instant accept trade offer and decline trade offer buttons on the incoming trade offers page',
  'Float rank (like 5th best in existence) data from csgofloat',
  'Currency converter, percentage calculator in the extension popup.',
  'Report known spam and scam comments automatically (like fake giveaway comments on profiles)',
  'Reply to comments by tagging the other user\'s name',
  'Generate a list of inventory items (to post advertisements, etc.)',
  '+rep button on profiles to post your reputation message after trade',
  'Check the value of multiple items in an inventory by selecting them',
  'Sort inventories and trade offers by price, tradability, name or position',
  'Set default sorting mode for inventories and trade offers',
  'All inventory items are loaded automatically, no need to wait for loading when searching or switching pages',
  'Sticker wear (condition percentage) in inventories and on the market',
  'Copy a user\'s permanent profile link (scammers often change their links automatically)',
  'Duplicate items count in inventories',
  'Set rules to for incoming friend requests (accept, ignore or block on matching conditions',
  'See if an item is present in another offer',
  'Auto-bump your Steam trading posts in groups and forums',
  'Other small features, automations, conveniences',
];

const featureShowcase = [
  {
    title: 'Inventories',
    imgSrc: '/img/features/inventory.png'
  },
  {
    title: 'Profiles',
    imgSrc: '/img/features/profile.png'
  },
  {
    title: 'Trade offers',
    imgSrc: '/img/features/tradeoffer.png'
  },
  {
    title: 'Inspection',
    imgSrc: '/img/features/inspect.png'
  },
  {
    title: 'Bookmarks',
    imgSrc: '/img/features/bookmarks.png'
  },
  {
    title: 'NSFW mode',
    imgSrc: '/img/features/nsfwmode.png'
  },
];

export default home;