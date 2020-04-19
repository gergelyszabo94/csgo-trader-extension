import { trackEvent } from 'utils/analytics';
import { goldenCommenters } from 'utils/goldening';
import commentPatternsToReport from 'utils/static/commentPatternsToReport';
import { getSessionID } from 'utils/utilsModular';
import DOMPurify from 'dompurify';

const handleReplyToCommentFunctionality = (event) => {
  // analytics
  trackEvent({
    type: 'event',
    action: 'CommentReply',
  });

  const commenterName = event.target.parentNode.parentNode.parentNode.querySelector('.commentthread_author_link')
    .querySelector('bdi').innerHTML.split(' <span class="nickname_block">')[0];
  const commentTextarea = document.querySelector('.commentthread_textarea');
  const currentContent = commentTextarea.value;

  if (currentContent === '') commentTextarea.value = `[b]@${commenterName}[/b]: `;
  else commentTextarea.value = `${currentContent}\n[b]@${commenterName}[/b]: `;

  commentTextarea.focus();
};

const addReplyToCommentsFunctionality = () => {
  document.querySelectorAll('.commentthread_comment_actions').forEach((commentThread) => {
    if (commentThread.querySelector('.replybutton') === null) {
      commentThread.insertAdjacentHTML(
        'beforeend',
        `<a class="actionlink replybutton" data-tooltip-text="Reply">
                <img style="height: 16px; width: 16px" src="${chrome.runtime.getURL('images/reply.png')}">
              </a>`,
      );
    }
  });

  document.querySelectorAll('.replybutton').forEach((replyButton) => {
    // if there was one previously added
    replyButton.removeEventListener('click', handleReplyToCommentFunctionality);

    replyButton.addEventListener('click', handleReplyToCommentFunctionality);
  });
};

const addCommentsMutationObserver = () => {
  const observer = new MutationObserver(() => {
    addReplyToCommentsFunctionality();
    goldenCommenters();
  });

  const commentThread = document.querySelector('.commentthread_comments');

  if (commentThread !== null) {
    observer.observe(commentThread, {
      subtree: true,
      attributes: false,
      childList: true,
    });
  }
};

const hideAndReport = (type, pageID, commentID) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

  let URL = '';
  if (type === 'profile') {
    URL = `https://steamcommunity.com/comment/Profile/hideandreport/${pageID}/-1/?`;
  } else if (type === 'group') {
    URL = `https://steamcommunity.com/comment/Clan/hideandreport/${pageID}/-1/?`;
  } else if (type === 'shared_file') {
    URL = `https://steamcommunity.com/comment/PublishedFile_Public/hideandreport/${pageID.ownerID}/${pageID.sharedFileID}/-1/?`;
  }

  const request = new Request(URL,
    {
      method: 'POST',
      headers,
      body: `sessionid=${getSessionID()}&gidcomment=${commentID}&hide=1&start=0&count=6&feature2=-1`,
    });

  fetch(request).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
    }
    return response.json();
  }).then(() => {
    const commentContentElement = document.getElementById(`comment_content_${commentID}`);
    const originalCommentText = commentContentElement.innerText;
    commentContentElement.innerHTML = DOMPurify.sanitize(`
    <p>This comment was <b>automatically reported to Steam by CSGO Trader Extension</b> for being scam/spam.</p>
    <p>If you think it was misidentified please contact: <a href"=https://csgotrader.app/" target="_blank">support@csgotrader.app</a>.</p>
    <p>To set your own reporting rules or turn this feature off go to the options and look for
    <b>"Flag scam comments"</b> and <b>"Your strings to report"</b> under General.
    The comment said: </p>
    <div>
        <span class="bb_spoiler">${originalCommentText}</span>
    </div>
    `);
  }).catch((err) => {
    console.log(err);
  });
};

const reportComments = (type, pageID) => {
  chrome.storage.local.get(['flagScamComments', 'customCommentsToReport'], (result) => {
    if (result.flagScamComments) {
      const mergedStringToReport = result.customCommentsToReport.concat(commentPatternsToReport);
      const spamTextCheck = new RegExp(mergedStringToReport.join('|'), 'i');

      document.querySelectorAll('.commentthread_comment.responsive_body_text').forEach((comment) => {
        if (spamTextCheck.test(comment.querySelector('.commentthread_comment_text').innerText)
            && !comment.classList.contains('hidden_post')) {
          // analytics
          trackEvent({
            type: 'event',
            action: 'CommentReported',
          });

          const commentID = comment.id.split('comment_')[1];
          hideAndReport(type, pageID, commentID);
        }
      });
    }
  });
};

export {
  addCommentsMutationObserver, handleReplyToCommentFunctionality,
  addReplyToCommentsFunctionality, reportComments,
};
