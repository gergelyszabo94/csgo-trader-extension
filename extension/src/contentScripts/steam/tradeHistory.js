import DOMPurify from 'dompurify';
import {
  logExtensionPresence, updateLoggedInUserInfo,
  addUpdatedRibbon,
} from 'utils/utilsModular';
import { listenToAcceptTrade } from 'utils/tradeOffers';
import { reloadPageOnExtensionUpdate } from 'utils/simpleUtils';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
listenToAcceptTrade();
reloadPageOnExtensionUpdate();

const bgBottom = document.getElementById('BG_bottom');
if (bgBottom !== null) {
  bgBottom.insertAdjacentHTML(
    'afterbegin',
    DOMPurify.sanitize(
      `<div class="tradeHistoryRibbon">
               <b>CSGO Trader:</b>
               You can check your trade history in much easier to navigate way in the extension's "Trade History" menu
            </div>`,
    ),
  );
}

chrome.runtime.sendMessage({ hasTabsAccess: 'hasTabsAccess' }, ((response) => {
  if (response) {
    const tradeHistoryRibbon = document.querySelector('.tradeHistoryRibbon');
    if (tradeHistoryRibbon !== null) {
      tradeHistoryRibbon.insertAdjacentHTML(
        'beforeend',
        DOMPurify.sanitize(
          '<div><a id="viewTradeHistory">Trade History (CSGO Trader)</a></div>',
        ),
      );
      document.getElementById('viewTradeHistory').addEventListener('click', () => {
        chrome.runtime.sendMessage({ openInternalPage: 'index.html?page=trade-history' }, () => {});
      });
    }
  }
}));
