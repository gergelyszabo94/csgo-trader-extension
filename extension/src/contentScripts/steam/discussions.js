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

let autoBumpInterval;
const doTheAutoBumping = () => {
  document.querySelectorAll('.commentthread_comment').forEach((commentThread) => {
    const commentTextElement = commentThread.querySelector('.commentthread_comment_text');
    if (commentTextElement !== null && commentTextElement.innerText.includes('Bump')) {
      const deleteButton = commentThread.querySelector('.forum_comment_action.delete');
      if (deleteButton !== null) deleteButton.click();
      setTimeout(() => {
        const deleteModal = document.querySelector('.newmodal');
        if (deleteModal !== null) {
          deleteModal.querySelector('.btn_green_white_innerfade.btn_medium').click();
        }
      }, 1000);
      // sometimes users are prompted to confirm deletion
    }
  });
  const commentTextArea = document.querySelector('.forumtopic_reply_entry').querySelector('.forumtopic_reply_textarea');
  commentTextArea.value = 'Bump';
  commentTextArea.focus();
  setTimeout(() => {
    document.querySelector('.btn_green_white_innerfade.btn_small').click();
  }, 1000);
};

const searchElement = document.getElementById('DiscussionSearchForm');
if (searchElement !== null) {
  searchElement.insertAdjacentHTML(
    'afterend',
    DOMPurify.sanitize(
      `<div class="discussionAutoBump">
                CSGOTrader Auto-bump this post:
                <input
                    type="checkbox"
                    id="autoBumpDiscussion"
                    title="If you tick this checkbox CSGOTrader will periodically (30 mins) post a comment under this discussion on your behalf
                    making the post appear on top of discussions. The post has to be kept open on a page to be auto-bumped."
                />
            </div>`,
    ),
  );
  const autoBumpCheckBox = document.getElementById('autoBumpDiscussion');

  chrome.storage.local.get(['discussionsToAutoBump'], ({ discussionsToAutoBump }) => {
    if (discussionsToAutoBump.includes(window.location.href)) {
      autoBumpCheckBox.checked = true;
      doTheAutoBumping();

      autoBumpInterval = setInterval(() => {
        doTheAutoBumping();
      }, (30 * 60 * 1000)); // 30 minutes
    } else autoBumpCheckBox.checked = false;
  });

  autoBumpCheckBox.addEventListener('change', (event) => {
    chrome.storage.local.get(['discussionsToAutoBump'], ({ discussionsToAutoBump }) => {
      let newDiscussionsToAutoBump = [];
      if (event.target.checked) {
        autoBumpInterval = setInterval(() => {
          doTheAutoBumping();
        }, (30 * 60 * 1000)); // 30 minutes

        if (discussionsToAutoBump.includes(window.location.href)) {
          newDiscussionsToAutoBump = discussionsToAutoBump;
        } else newDiscussionsToAutoBump = [...discussionsToAutoBump, window.location.href];
      } else {
        clearInterval(autoBumpInterval);

        if (discussionsToAutoBump.includes(window.location.href)) {
          newDiscussionsToAutoBump = discussionsToAutoBump.filter((href) => {
            return href !== window.location.href;
          });
        } else newDiscussionsToAutoBump = discussionsToAutoBump;
      }

      chrome.storage.local.set({ discussionsToAutoBump: newDiscussionsToAutoBump });
    });
  });
}
