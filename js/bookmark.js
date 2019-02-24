chrome.storage.sync.get('bookmarks', function(result) {
    console.log(result.bookmarks);
    let bookmarks = [];
    result.bookmarks.forEach(function (element, index) {
        let bookmark = `<div class="buildingBlock">
        <h2>${element.itemInfo.name}</h2>
        <p>
            ${element.itemInfo.exterior}
        </p>
        </div>`;
        bookmarks.push(bookmark);
    });
    $('#bookmarks').html(bookmarks);
});
