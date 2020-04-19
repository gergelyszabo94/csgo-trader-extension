import { addUpdatedRibbon, logExtensionPresence, updateLoggedInUserInfo } from 'utils/utilsModular';
import { trackEvent } from 'utils/analytics';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
trackEvent({
  type: 'pageview',
  action: 'DiscussionsView',
});
