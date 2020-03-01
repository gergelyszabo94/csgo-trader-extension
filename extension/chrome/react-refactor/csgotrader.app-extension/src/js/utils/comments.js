import { trackEvent } from "js/utils/analytics";
import { goldenCommenters } from 'js/utils/goldening';
import commentPatternsToReport from 'js/utils/static/commentPatternsToReport';

const addReplyToCommentsFunctionality = () => {
    document.querySelectorAll('.commentthread_comment_actions').forEach(commentThread => {
        if (commentThread.querySelector('.replybutton') === null) {
            commentThread.insertAdjacentHTML('beforeend',
                `<a class="actionlink replybutton" data-tooltip-text="Reply">
                        <img style="height: 16px; width: 16px" src="${chrome.runtime.getURL("images/reply.png")}">
                       </a>`);
        }
    });

    document.querySelectorAll('.replybutton').forEach(replyButton => {
        // if there was one previously added
        replyButton.removeEventListener('click', handleReplyToCommentFunctionality);

        replyButton.addEventListener('click', handleReplyToCommentFunctionality);
    });
};

const handleReplyToCommentFunctionality = (event) => {
    // analytics
    trackEvent({
        type: 'event',
        action: 'CommentReply'
    });

    const commenterName = event.target.parentNode.parentNode.parentNode.querySelector('.commentthread_author_link').querySelector('bdi').innerHTML.split(' <span class="nickname_block">')[0];
    const commentTextarea = document.querySelector('.commentthread_textarea');
    const currentContent = commentTextarea.value;

    if (currentContent === '') commentTextarea.value = `[b]@${commenterName}[/b]: `;
    else commentTextarea.value = `${currentContent}\n[b]@${commenterName}[/b]: `;

    commentTextarea.focus();
};

const addCommentsMutationObserver = () => {
    const observer = new MutationObserver(() => {
        addReplyToCommentsFunctionality();
        goldenCommenters();
    });

    const commentThread = document.querySelector('.commentthread_comments');

    if (commentThread  !== null) {
        observer.observe(commentThread, {
            subtree: true,
            attributes: false,
            childList: true
        })
    }
};

const reportComments = () => {
    chrome.storage.local.get(['flagScamComments', 'customCommentsToReport'], (result) => {
        if (result.flagScamComments) {
            const mergedStringToReport = result.customCommentsToReport.concat(commentPatternsToReport);
            const spamTextCheck = new RegExp(mergedStringToReport.join('|'), 'i');

            document.querySelectorAll('.commentthread_comment.responsive_body_text').forEach(comment => {
                if (spamTextCheck.test(comment.querySelector('.commentthread_comment_text').innerText) && !comment.classList.contains('hidden_post')){
                    // analytics
                    trackEvent({
                        type: 'event',
                        action: 'CommentReported'
                    });
                    comment.querySelector('a.report_and_hide').querySelector('img').click();
                }
            });
        }
    });
};

export { addCommentsMutationObserver, handleReplyToCommentFunctionality, addReplyToCommentsFunctionality, reportComments };