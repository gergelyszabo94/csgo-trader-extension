import {
  addUpdatedRibbon, logExtensionPresence, updateLoggedInUserInfo,
  removeLinkFilterFromLinks,
} from 'utils/utilsModular';
import DOMPurify from 'dompurify';
import { deleteForumComment, postForumComment } from 'utils/comments';
import { injectScript } from 'utils/injection';
import { overrideShowTradeOffer } from 'utils/steamOverriding';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();
removeLinkFilterFromLinks();

const nextBump = Math.floor((Math.random() * 10) + 31);

const forumTopicEl = document.querySelector('.commentthread_area.forumtopic_comments');
const abuseID = forumTopicEl.id.split('commentthread_ForumTopic_')[1].split('_')[0];
const gIDForum = forumTopicEl.id.split('_')[3];
const gIDTopic = forumTopicEl.id.split('_')[4];

const doTheAutoBumping = () => {
  const getExtendedDataScript = `document.querySelector('body').setAttribute('commentExtendedData', g_rgCommentThreads['${forumTopicEl.id.split('commentthread_')[1].split('_area')[0]}'].m_rgCommentData.extended_data)`;
  const extendedData = injectScript(getExtendedDataScript, true, 'getExtendedData', 'commentExtendedData');

  document.querySelectorAll('.commentthread_comment').forEach((commentThread) => {
    const commentTextElement = commentThread.querySelector('.commentthread_comment_text');
    if (commentTextElement !== null && commentTextElement.innerText.includes('Bump')
      && !commentThread.classList.contains('commentthread_deleted_comment')
      && !commentThread.classList.contains('commentthread_deleted_expanded')) {
      const commentID = commentThread.id.split('comment_')[1];
      deleteForumComment(abuseID, gIDForum, gIDTopic, commentID, extendedData);
      commentTextElement.innerText = `CSGO Trader replaced this Bump comment with a new one. The page will refresh and the next bump will happen in ${nextBump} minutes.`;
    }
  });

  postForumComment(abuseID, gIDForum, gIDTopic, 'Bump', extendedData);
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

      setTimeout(() => {
        window.location.reload();
      }, nextBump * 60 * 1000);
    } else autoBumpCheckBox.checked = false;

    autoBumpCheckBox.addEventListener('change', (event) => {
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

      chrome.storage.local.set({ discussionsToAutoBump: newDiscussionsToAutoBump }, () => {
        window.location.reload();
      });
    });
  });

  overrideShowTradeOffer();
}
