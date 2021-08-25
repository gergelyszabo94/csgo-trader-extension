import { trackEvent } from 'utils/analytics';
import { logExtensionPresence } from 'utils/utilsModular';

const bump = async () => {
    document.querySelectorAll('.btn-bump___1-VFc').forEach((bumpButton) => {
        bumpButton.click();
    });

    await trackEvent({
        type: 'event',
        action: 'LoungeBump',
    });
};

logExtensionPresence();

(async () => {
    await trackEvent({
        type: 'pageview',
        action: 'LoungeTradesView',
    });
})();

chrome.storage.local.get('loungeBump', (result) => {
    if (result.loungeBump) {
        // ugly way to wait for the trades to load and become "bumpable"
        setTimeout(async () => {
            await bump();
        }, 5000);

        const reloadInterval = Math.floor(Math.random() * 10 + 31);

        setTimeout(() => {
            window.location.reload();
        }, reloadInterval * 60 * 1000);
    }
});
