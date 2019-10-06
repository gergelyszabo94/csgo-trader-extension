addReplytoCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
updateLoggedInUserID();
gaTrackPageView();

setInterval( () =>{if(/#announcements|#comments/.test(window.location.href))addReplytoCommentsFunctionality()}, 2000);