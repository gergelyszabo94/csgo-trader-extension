import { pricingProviders, currencies } from 'utils/static/pricing';
import { sortingModes, offersSortingModes } from 'utils/static/sortingModes';
import defaultPopupLinks from 'utils/static/defaultPopupLinks';
import { actions, conditions } from 'utils/static/friendRequests';

const storageKeys = {
  quickDeclineOffer: true,
  openOfferInTab: true,
  showPlusRepButton: true,
  reputationMessage: '+rep',
  showReoccButton: true,
  reoccuringMessage: 'I don\'t have other accounts. If someone adds you with my name and picture they are scammers.',
  nsfwFilter: false,
  flagScamComments: true,
  bookmarks: [],
  steamAPIKey: '',
  apiKeyValid: false,
  showRealStatus: true,
  colorfulItems: true,
  loungeBump: false,
  tradersBump: false,
  markScammers: true,
  numberOfListings: 10,
  itemPricing: true,
  pricingProvider: pricingProviders.csgotrader.name,
  pricingMode: pricingProviders.csgotrader.pricing_modes.csgotrader.name,
  prices: null,
  currency: currencies.USD.short,
  exchangeRate: 1.0,
  exchangeRates: null,
  hideOtherExtensionPrices: true,
  inventorySortingMode: sortingModes.default.key,
  notifyOnUpdate: false,
  offerSortingMode: sortingModes.default.key,
  switchToOtherInventory: false,
  popupLinks: defaultPopupLinks,
  steamIDOfUser: '',
  customCommentsToReport: [],
  autoFloatMarket: true,
  autoFloatOffer: true,
  autoFloatInventory: true,
  analyticsEvents: [],
  clientID: '',
  telemetryOn: false,
  telemetryConsentSubmitted: false,
  tradeOffersLargerItems: true,
  tradeOffersSortingMode: offersSortingModes.default.key,
  defaultConverterCurrency1: currencies.USD.short,
  defaultConverterCurrency2: currencies.EUR.short,
  marketOriginalPrice: true,
  autoSetSteamAPIKey: true,
  autoOpenIDLogin: false,
  csgotradersAutoLogin: false,
  tradeHistoryLastUpdate: 0,
  tradeHistoryOffers: true,
  tradeHistoryInventory: true,
  tradeOfferHeaderToLeft: true,
  showStickerPrice: true,
  activeOffers: {
    lastFullUpdate: '',
    items: [],
    sent: [],
    received: [],
    descriptions: [],
  },
  itemInOffersInventory: true,
  itemInOtherOffers: true,
  showUpdatedRibbon: false,
  friendRequests: {
    inviters: [],
    lastUpdated: Date.now(),
  },
  groupInvites: {
    invitedTo: [],
    lastUpdated: Date.now(),
  },
  steamSessionID: '',
  friendRequestLogs: [],
  friendRequestEvalRules: [
    {
      active: false,
      condition: {
        type: conditions.profile_private.key,
      },
      action: actions.ignore.key,
    },
    {
      active: false,
      condition: {
        type: conditions.steam_level_under.key,
        value: 5,
      },
      action: actions.ignore.key,
    },
    {
      active: false,
      condition: {
        type: conditions.vac_banned.key,
      },
      action: actions.ignore.key,
    },
    {
      active: false,
      condition: {
        type: conditions.community_banned.key,
      },
      action: actions.ignore.key,
    },
    {
      active: false,
      condition: {
        type: conditions.trade_banned.key,
      },
      action: actions.ignore.key,
    },
    {
      active: false,
      condition: {
        type: conditions.streamrep_banned.key,
      },
      action: actions.ignore.key,
    },
    {
      active: false,
      condition: {
        type: conditions.inventory_private.key,
      },
      action: actions.ignore.key,
    },
  ],
  ignoreGroupInvites: false,
  floatQueueActivity: {
    lastUsed: Date.now(),
    usedAt: '',
  },
  removeWebChatHeader: true,
  discussionsToAutoBump: [],
  usefulTitles: false,
  reloadListingOnError: true,
  monitorFriendRequests: true,
  showRealMoneySiteLinks: true,
};

const nonSettingStorageKeys = ['bookmarks', 'prices', 'exchangeRates', 'analyticsEvents', 'clientID',
  'tradeHistoryLastUpdate', 'activeOffers', 'showUpdatedRibbon', 'steamSessionID', 'groupInvites',
  'friendRequests', 'friendRequestLogs', 'friendRequestEvalRules', 'floatQueueActivity', 'discussionsToAutoBump'];

export { storageKeys, nonSettingStorageKeys };
