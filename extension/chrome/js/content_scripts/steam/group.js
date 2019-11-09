logExtensionPresence();
addReplytoCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
updateLoggedInUserID();
trackEvent({
    type: 'pageview',
    action: 'GroupView'
});

setInterval( () =>{if(/#announcements|#comments/.test(window.location.href))addReplytoCommentsFunctionality()}, 2000);