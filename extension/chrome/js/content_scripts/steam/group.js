addReplytoCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
updateLoggedInUserID();

setInterval( () =>{if(/#announcements|#comments/.test(window.location.href))addReplytoCommentsFunctionality()}, 2000);