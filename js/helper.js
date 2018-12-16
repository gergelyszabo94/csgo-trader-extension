// Convert time to format yyyy-mm-dd
function formatDate(time) {
    var date = new Date();
    date.setTime(time * 1000);
    var day = (date.getDate().toString().length == 1) ? '0' + date.getDate() : date.getDate();
    var month = date.getMonth() + 1;
    month = month.toString().length == 1 ? '0' + month.toString() : month;
    return date.getFullYear() + '-' + month + '-' + day;
}
