import { currencies, pricingProviders, realTimePricingModes } from 'utils/static/pricing';
import { listingsSortingModes, offersSortingModes, sortingModes } from 'utils/static/sortingModes';
import defaultPopupLinks from 'utils/static/defaultPopupLinks';
import { actions, conditions } from 'utils/static/friendRequests';
import { actions as offerActions, conditions as offerConditions, operators } from 'utils/static/offers';
import { notificationSounds } from 'utils/static/notifications';

const storageKeys = {
  quickDeclineOffer: true,
  openOfferInTab: true,
  showPlusRepButton: true,
  reputationMessage: '+rep',
  showReoccButton: true,
  reoccuringMessage: 'I don\'t have other accounts. If someone adds you with my name and picture they are scammers.',
  nsfwFilter: false,
  bookmarks: [],
  steamAPIKey: '',
  apiKeyValid: false,
  steamAcessToken: '',
  steamAcessTokenValid: false,
  showRealStatus: true,
  colorfulItems: true,
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
  nickNameOfUser: '',
  autoFloatMarket: true,
  autoFloatOffer: true,
  autoFloatInventory: true,
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
  discussionsToAutoBumpToDelete: [],
  usefulTitles: false,
  reloadListingOnError: true,
  monitorFriendRequests: false,
  showRealMoneySiteLinks: true,
  realTimePricesFreqSuccess: 3000,
  realTimePricesFreqFailure: 15000,
  realTimePricesMode: realTimePricingModes.ask_price.key,
  realTimePricesAutoLoadOffer: false,
  realTimePricesAutoLoadInventory: false,
  priceQueueActivity: {
    lastUsed: Date.now(),
    usedAt: '',
  },
  userSteamWalletCurrency: currencies.USD.short,
  linkFilterOff: false,
  marketListingsInstantBuy: true,
  inventoryInstantQuickButtons: true,
  safeInstantQuickSell: false,
  marketMainPagePricesAutoLoad: true,
  marketHistoryEventsToShow: 50,
  marketShowFloatValuesOnly: false,
  marketListingsDefaultSorting: listingsSortingModes.default.key,
  marketAlwaysShowFloatTechnical: false,
  showSelectedItemsTable: true,
  highlightSeenListings: true,
  calculatorConversionPlaceholder: 100,
  calculatorPercentagePercentage: 3,
  calculatorPercentageOf: 90,
  calculatorReversePercentage: 30,
  calculatorReverseValue: 2.7,
  calculatorIncDecPercentage: 27,
  calculatorIncDecResult: 1000,
  monitorIncomingOffers: false,
  tradeOffersEventLogs: [],
  offerEvalRules: [
    {
      active: false,
      conditions: [
        {
          type: offerConditions.giving_items_under.key,
          value: 1,
        },
        {
          type: offerConditions.no_message.key,
        },
      ],
      operators: [
        operators.and.key,
      ],
      action: offerActions.notify.key,
    },
    {
      active: false,
      conditions: [
        {
          type: offerConditions.profit_over.key,
          value: offerConditions.profit_over.default_value,
        },
      ],
      operators: [],
      action: offerActions.notify.key,
    },
    {
      active: false,
      conditions: [
        {
          type: offerConditions.profit_percentage_over.key,
          value: offerConditions.profit_percentage_over.default_value,
        },
      ],
      operators: [],
      action: offerActions.notify.key,
    },
    {
      active: false,
      conditions: [
        {
          type: offerConditions.receiving_items_under.key,
          value: 1,
        },
        {
          type: offerConditions.no_message.key,
        },
      ],
      operators: [
        operators.and.key,
      ],
      action: offerActions.decline.key,
    },
    {
      active: false,
      conditions: [
        {
          type: offerConditions.receiving_items_under.key,
          value: 1,
        },
        {
          type: offerConditions.message_includes.key,
          value: offerConditions.message_includes.default_value,
        },
      ],
      operators: [
        operators.and.key,
      ],
      action: offerActions.accept.key,
    },
  ],
  marketShowBuySellNonCommodity: true,
  marketShowRecentActivityNonCommodity: true,
  notificationSoundOn: true,
  notificationSoundToPlay: notificationSounds['done-for-you'].key,
  notificationVolume: 50,
  customNotificationURL: 'https://csgotrader.app/extension/sound/notification/glitch-in-the-matrix.ogg',
  showNumberOfOfferOnBadge: true,
  notifyOnFriendRequest: false,
  sendOfferBasedOnQueryParams: false,
  showPriceEmpireLinkInInventory: true,
  selectItemsBasedOnQueryParams: true,
  discordNotificationHook: '',
  allowDiscordNotification: false,
  showBuffLookupInInventory: false,
  removeAnimatedProfileBackgrounds: false,
  inventoryShowCopyButtons: true,
  outBidPercentage: 1,
  showShortExteriorsInventory: true,
  showShortExteriorsOffers: true,
  clickChangeOfferAutomatically: false,
  offerPresetMessages: [
    'Feel free to counter!',
    'That is the max I can do here, sorry!',
    'Feel free to add me to discuss this further',
  ],
  showChatPresetMessages: true,
  chatPresetMessages: [
    'Hello! How can I help you today?',
    'Hi! I have seen you added me but you are offline now. Message me later and tell me what I can do for you.',
  ],
  notifyAboutBeingLoggedOut: false,
  notifyAboutBeingLoggedOutOnDiscord: false,
  showTradeLockIndicatorInInventories: true,
  numberOfFloatDigitsToShow: 4,
  disableCancelEscrowedTrades: false,
  showPaintSeedOnItems: false,
  showFloatRankOnItems: false,
  priceUpdateFreq: 24,
  contrastingLook: false,
  showFloatDBLookupInInventory: false,
  fixTradeURLToken: true,
  showYearsOnMarketGraphs: true,
  logOutDetected: false,
  lastLogoutNotified: new Date('2020-01-01T00:00:00.000Z').getTime(),
  inventoryShowDuplicateCount: true,
  legitSiteBotGroup: [
    'bitskinsbots',
    'skinportbots',
    'tradeitggbots',
    'SkinwalletBotsOfficial',
    'skinswapbots',
  ],
  moveWithArrowKeysInventory: true,
  showAllExteriorsInventory: false,
  marketEnhanceStickers: true,
  tradeOfferPricEmpireAction: true,
  tradeOfferBuffAction: true,
  tradeOfferFloatAction: true,
  resizeAndRepositionProtectedIcon: true,
};

const nonSettingStorageKeys = ['bookmarks', 'prices', 'exchangeRates', 'clientID',
  'tradeHistoryLastUpdate', 'activeOffers', 'showUpdatedRibbon', 'steamSessionID', 'groupInvites',
  'friendRequests', 'friendRequestLogs', 'friendRequestEvalRules', 'floatQueueActivity',
  'priceQueueActivity', 'userSteamWalletCurrency', 'tradeOffersEventLogs', 'numberOfNewItems', 'numberOfComments',
  'recent401Detected', 'acessToken', 'activeOffers'];

export { storageKeys, nonSettingStorageKeys };
