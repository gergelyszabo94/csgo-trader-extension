addReplytoCommentsFunctionality();
addCommentsMutationObserver();
reportComments();
updateLoggedInUserID();

setInterval(function () {
    if(/#announcements|#comments/.test(window.location.href)){
        addReplytoCommentsFunctionality();
    }
},2000);