import DOMPurify from 'dompurify';
import {
  logExtensionPresence, updateLoggedInUserInfo,
  addUpdatedRibbon,
} from 'utils/utilsModular';
import { trackEvent } from 'utils/analytics';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
trackEvent({
  type: 'pageview',
  action: 'SteamTradeHistoryView',
});

const bgBottom = document.getElementById('BG_bottom');
if (bgBottom !== null) {
  bgBottom.insertAdjacentHTML(
    'afterbegin',
    DOMPurify.sanitize('<div class="tradeHistoryRibbon"><b>CSGO Trader:</b> You can check your trade history in much easier to navigate way in the extension\'s "Trade History" menu</div>'),
  );
}
