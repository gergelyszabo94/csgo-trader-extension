import { logExtensionPresence } from 'utils/utilsModular';
import { trackEvent } from 'utils/analytics';

const removeHeader = () => {
  const header = document.querySelector('.main_SteamPageHeader_3EaXO');
  if (header !== null) header.remove();
};

chrome.storage.local.get(['removeWebChatHeader'], ({ removeWebChatHeader }) => {
  if (removeWebChatHeader) {
    const tryToRemoveHeaderPeriodically = setInterval(() => {
      removeHeader();
    }, 5000);

    setTimeout(() => {
      clearInterval(tryToRemoveHeaderPeriodically);
    }, 60000);
  }
});

logExtensionPresence();
trackEvent({
  type: 'pageview',
  action: 'WebChat',
});
