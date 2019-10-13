addReplytoCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
updateLoggedInUserID();
trackPageView();

setInterval( () =>{if(/#announcements|#comments/.test(window.location.href))addReplytoCommentsFunctionality()}, 2000);