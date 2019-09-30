function bump(){document.querySelectorAll('.btn-bump___1-VFc').forEach(bumpButton => {bumpButton.click()})}

chrome.storage.local.get('loungeBump', (result) => {
    if(result.loungeBump){
        // ugly way to wait for the trades to load and become "bumpable"
        setTimeout(() => {bump()}, 5000);

        let reloadInterval = Math.floor((Math.random() * 10) + 31);

        setTimeout(() => {location.reload()}, reloadInterval*60*1000);
    }
});