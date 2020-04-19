import { addUpdatedRibbon, logExtensionPresence, updateLoggedInUserInfo } from 'utils/utilsModular';
import { trackEvent } from 'utils/analytics';
import DOMPurify from 'dompurify';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
trackEvent({
  type: 'pageview',
  action: 'DiscussionsView',
});

const searchElement = document.getElementById('DiscussionSearchForm');
if (searchElement !== null) {
  searchElement.insertAdjacentHTML(
    'afterend',
    DOMPurify.sanitize(
      `<div>
                Auto-bump this post:
                <input
                    type="checkbox"
                    id="autoBumpDiscussion"
                    title="If you tick this checkbox CSGOTrader will periodically post a comment under this discussion on your behalf
                    making the post appear on top of discussions. The post has to be kept open to be auto-bumped."
                />
            </div>`,
    ),
  );
  const autoBumpCheckBox = document.getElementById('autoBumpDiscussion');

  chrome.storage.local.get(['discussionsToAutoBump'], ({ discussionsToAutoBump }) => {
    autoBumpCheckBox.checked = discussionsToAutoBump.includes(window.location.href);
  });

  autoBumpCheckBox.addEventListener('change', (event) => {
    chrome.storage.local.get(['discussionsToAutoBump'], ({ discussionsToAutoBump }) => {
      let newDiscussionsToAutoBump = [];
      if (event.target.checked) {
        if (discussionsToAutoBump.includes(window.location.href)) {
          newDiscussionsToAutoBump = discussionsToAutoBump;
        } else newDiscussionsToAutoBump = [...discussionsToAutoBump, window.location.href];
      } else if (discussionsToAutoBump.includes(window.location.href)) {
        newDiscussionsToAutoBump = discussionsToAutoBump.filter((href) => {
          return href !== window.location.href;
        });
      } else newDiscussionsToAutoBump = discussionsToAutoBump;

      chrome.storage.local.set({ discussionsToAutoBump: newDiscussionsToAutoBump });
    });
  });
}
