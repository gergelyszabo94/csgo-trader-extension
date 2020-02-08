/* global chrome */
let devMode = true;
const router = [
  {
    title: "FAQ",
    id: "faq",
    path: "https://csgotrader.app/faq/",
    isExternal: true,
    isActive: false
  },
  {
    title: "Options",
    id: "options",
    path: "index.html",
    isExternal: true,
    isActive: true
  },
  {
    title: "Changelog",
    id: "changelog",
    path: "https://csgotrader.app/changelog/",
    isExternal: true,
    isActive: true
  },
  {
    title: "Bookmarks",
    id: "bookmarks",
    path: "bookmarks.html",
    isExternal: false,
    isActive: true
  },
  {
    title: "Inventory",
    id: "inventory",
    path: "https://steamcommunity.com/my/inventory/",
    isExternal: true,
    isActive: true
  },
  {
    title: "Trade Offers",
    id: "tradeoffers",
    path: "https://steamcommunity.com/",
    isExternal: false,
    isActive: true
  }
];

console.log(chrome);

const getRouter = () => {
  if (chrome.storage && !devMode) {
    chrome.storage.local.get(["popupLinks"], result => {
      if (result !== undefined) {
        return result;
      }
    });
  }

  return router;
};

export default getRouter();
