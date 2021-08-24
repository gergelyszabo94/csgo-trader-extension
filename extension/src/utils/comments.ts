import DOMPurify from 'dompurify';
import commentPatternsToReport from 'utils/static/commentPatternsToReport';
import { getSessionID } from 'utils/utilsModular';
import { goldenCommenters } from 'utils/goldening';
import { trackEvent } from 'utils/analytics';
import { SharedFileIDAndOwner } from 'types';
import { FlagScamComments } from 'types/storage';
import axios from 'axios';
import { chromeStorageLocalGet } from './chromeUtils';

const handleReplyToCommentFunctionality = async (event) => {
    await trackEvent({
        type: 'event',
        action: 'CommentReply',
    });

    const commenterName = event.target.parentNode.parentNode.parentNode
        .querySelector('.commentthread_author_link')
        .querySelector('bdi')
        .innerHTML.split(' <span class="nickname_block">')[0];
    const commentTextarea = document.querySelector<HTMLTextAreaElement>('.commentthread_textarea');
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

const hideAndReport = async (type: string, pageID: SharedFileIDAndOwner, commentID: string) => {
    let URL: string;
    switch (type) {
        case 'profile':
            URL = `https://steamcommunity.com/comment/Profile/hideandreport/${pageID}/-1/?`;
            break;
        case 'group':
            URL = `https://steamcommunity.com/comment/Clan/hideandreport/${pageID}/-1/?`;
            break;
        case 'shared_file':
            URL = `https://steamcommunity.com/comment/PublishedFile_Public/hideandreport/${pageID.ownerID}/${pageID.sharedFileID}/-1/?`;
            break;
    }

    try {
        const response = await axios.post(URL, {
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: `sessionid=${getSessionID()}&gidcomment=${commentID}&hide=1&start=0&count=6&feature2=-1`,
        });

        if (response.status !== 200) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }
        const commentContentElement = document.getElementById(`comment_content_${commentID}`);
        const originalCommentText = commentContentElement.innerText;
        commentContentElement.innerHTML = DOMPurify.sanitize(
            `<p>This comment was <b>automatically reported to Steam by CSGO Trader Extension</b> for being scam/spam.</p>
        <p>If you think it was misidentified please contact: <a href"=https://csgotrader.app/" target="_blank">support@csgotrader.app</a>.</p>
        <p>To set your own reporting rules or turn this feature off go to the options and look for
        <b>"Flag scam comments"</b> and <b>"Your strings to report"</b> under General.
        The comment said: </p>
        <div>
            <span class="bb_spoiler">${originalCommentText}</span>
        </div>`,
            { ADD_ATTR: ['target'] },
        );
    } catch (err) {
        console.log(err);
    }
};

const reportComments = async (type: string, pageID: SharedFileIDAndOwner) => {
    const result = await chromeStorageLocalGet(['flagScamComments', 'customCommentsToReport']);

    const flagScamComments: FlagScamComments = result.flagScamComments;
    const customCommentsToReport = result.customCommentsToReport;

    if (flagScamComments) {
        const mergedStringToReport = customCommentsToReport.concat(commentPatternsToReport);
        const spamTextCheck = new RegExp(mergedStringToReport.join('|'), 'i');

        for (const comment of Array.from(document.querySelectorAll('.commentthread_comment.responsive_body_text'))) {
            if (
                spamTextCheck.test(comment.querySelector<HTMLElement>('.commentthread_comment_text').innerText) &&
                !comment.classList.contains('hidden_post')
            ) {
                // analytics
                await trackEvent({
                    type: 'event',
                    action: 'CommentReported',
                });

                const commentID = comment.id.split('comment_')[1];
                hideAndReport(type, pageID, commentID);
            }
        }
    }
};

const deleteForumComment = async (abuseID, gIDForum, gIDTopic, commentID, extendedData) => {
    try {
        const response = await axios.post(
            `https://steamcommunity.com/comment/ForumTopic/delete/${abuseID}/${gIDForum}/`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    Accept: 'text/javascript, text/html, application/xml, text/xml, */*',
                },
                body: `sessionid=${getSessionID()}&gidcomment=${commentID}&start=0&count=50&feature2=${gIDTopic}&oldestfirst=true&include_raw=true&extended_data=${extendedData}`,
            },
        );

        if (response.status !== 200) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }
    } catch (err) {
        console.log(err);
    }
};

const postForumComment = async (abuseID, gIDForum, gIDTopic, comment, extendedData) => {
    try {
        const response = await axios.post(
            `https://steamcommunity.com/comment/ForumTopic/post/${abuseID}/${gIDForum}/`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    Accept: 'text/javascript, text/html, application/xml, text/xml, */*',
                },
                body: `sessionid=${getSessionID()}&comment=${comment}&count=50&feature2=${gIDTopic}&oldestfirst=true&include_raw=true&extended_data=${extendedData}`,
            },
        );
        if (response.status !== 200) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }
    } catch (err) {
        console.log(err);
    }
};

export {
    addCommentsMutationObserver,
    handleReplyToCommentFunctionality,
    postForumComment,
    addReplyToCommentsFunctionality,
    reportComments,
    deleteForumComment,
};
