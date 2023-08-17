import { getSessionID } from 'utils/utilsModular';

const handleReplyToCommentFunctionality = (event) => {
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

const deleteForumComment = (abuseID, gIDForum, gIDTopic, commentID, extendedData) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  headers.append('accept', 'text/javascript, text/html, application/xml, text/xml, */*');

  const request = new Request(
    `https://steamcommunity.com/comment/ForumTopic/delete/${abuseID}/${gIDForum}/`,
    {
      method: 'POST',
      headers,
      body: `sessionid=${getSessionID()}&gidcomment=${commentID}&start=0&count=50&feature2=${gIDTopic}&oldestfirst=true&include_raw=true&extended_data=${extendedData}`,
    },
  );

  fetch(request).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
    }
    return response.json();
  }).then(() => {}).catch((err) => {
    console.log(err);
  });
};

const postForumComment = (abuseID, gIDForum, gIDTopic, comment, extendedData) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  headers.append('accept', 'text/javascript, text/html, application/xml, text/xml, */*');

  const request = new Request(
    `https://steamcommunity.com/comment/ForumTopic/post/${abuseID}/${gIDForum}/`,
    {
      method: 'POST',
      headers,
      body: `sessionid=${getSessionID()}&comment=${comment}&count=50&feature2=${gIDTopic}&oldestfirst=true&include_raw=true&extended_data=${extendedData}`,
    },
  );

  fetch(request).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
    }
    return response.json();
  }).then(() => {}).catch((err) => {
    console.log(err);
  });
};

export {
  addCommentsMutationObserver, handleReplyToCommentFunctionality, postForumComment,
  addReplyToCommentsFunctionality, deleteForumComment,
};
