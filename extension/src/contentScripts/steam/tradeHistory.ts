import DOMPurify from 'dompurify';

import { trackEvent } from 'utils/analytics';
import { logExtensionPresence, updateLoggedInUserInfo, addUpdatedRibbon } from 'utils/utilsModular';

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
        DOMPurify.sanitize(
            `<div class="tradeHistoryRibbon">
               <b>CSGO Trader:</b>
               You can check your trade history in much easier to navigate way in the extension's "Trade History" menu
            </div>`,
        ),
    );
}

chrome.runtime.sendMessage({ hasTabsAccess: 'hasTabsAccess' }, (response) => {
    if (response) {
        const tradeHistoryRibbon = document.querySelector('.tradeHistoryRibbon');
        if (tradeHistoryRibbon !== null) {
            tradeHistoryRibbon.insertAdjacentHTML(
                'beforeend',
                DOMPurify.sanitize('<div><a id="viewTradeHistory">Trade History (CSGO Trader)</a></div>'),
            );
            document.getElementById('viewTradeHistory').addEventListener('click', () => {
                chrome.runtime.sendMessage({ openInternalPage: 'index.html?page=trade-history' }, () => {});
            });
        }
    }
});
