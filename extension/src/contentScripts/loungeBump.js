import { logExtensionPresence } from 'utils/utilsModular';

const bump = () => {
  document.querySelectorAll('.btn-bump___1-VFc').forEach((bumpButton) => {
    bumpButton.click();
  });
};

logExtensionPresence();

chrome.storage.local.get('loungeBump', (result) => {
  if (result.loungeBump) {
    // ugly way to wait for the trades to load and become "bumpable"
    setTimeout(() => {
      bump();
    }, 5000);

    const reloadInterval = Math.floor((Math.random() * 10) + 31);

    setTimeout(() => {
      window.location.reload();
    }, reloadInterval * 60 * 1000);
  }
});
