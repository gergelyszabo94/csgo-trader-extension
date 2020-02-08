function goldenMemberNames() {
    document.querySelectorAll('.member_block').forEach(memberBlock =>{
       if (memberBlock.querySelector('.linkFriend').innerText.includes('csgotrader.app')) {
           memberBlock.querySelector('.playerAvatar').classList.add('golden');
           memberBlock.querySelector('.member_block_content').classList.remove('online', 'offline', 'in-game');
           memberBlock.querySelector('.member_block_content').classList.add('golden');
       }
    });
}

logExtensionPresence();
addReplytoCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
goldenCommenters();
updateLoggedInUserID();
listenToLocationChange(goldenMemberNames);
trackEvent({
    type: 'pageview',
    action: 'GroupView'
});

if (document.location.href.includes('/members')) goldenMemberNames();

setInterval( () =>{if(/#announcements|#comments/.test(window.location.href))addReplytoCommentsFunctionality()}, 2000);