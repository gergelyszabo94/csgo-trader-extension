chrome.storage.sync.get('bookmarks', function(result) {
    console.log(result.bookmarks);
});