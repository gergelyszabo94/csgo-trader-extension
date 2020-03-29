import { pricingProviders, currencies } from 'utils/static/pricing';
import { sortingModes, offersSortingModes } from 'utils/static/sortingModes';
import defaultPopupLinks from 'utils/static/defaultPopupLinks';

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
  telemetryOn: true,
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
    offers: {
      items: [],
      sent: [],
      received: [],
      descriptions: [],
    },
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
};

const nonSettingStorageKeys = ['bookmarks', 'prices', 'exchangeRates', 'analyticsEvents', 'clientID',
  'tradeHistoryLastUpdate', 'activeOffers', 'showUpdatedRibbon', 'steamSessionID', 'groupInvites',
  'friendRequests'];

export { storageKeys, nonSettingStorageKeys };
