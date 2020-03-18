import { trackEvent } from 'utils/analytics';
import { logExtensionPresence } from 'utils/utilsModular';

const bump = () => {
  document.querySelectorAll('.btn.btn-custom.btn-xs').forEach((button) => {
    const link = button.getAttribute('href');
    const request = new Request(link);

    fetch(request).then(() => {});
  });

  trackEvent({
    type: 'event',
    action: 'TradersBump',
  });
};

logExtensionPresence();

trackEvent({
  type: 'pageview',
  action: 'TradersTradesView',
});

chrome.storage.local.get('tradersBump', ({ tradersBump }) => {
  if (tradersBump) {
    // redirects form the "The page you were looking for doesn't exist." page
    if (window.location.href.includes('cf_chl_jschl_tk')) {
      window.location.href = 'https://csgotraders.net/mytrades';
    }

    // ugly way to wait for the trades to load and become "bumpable"
    setTimeout(() => {
      bump();
    }, 2000);

    const reloadInterval = Math.floor((Math.random() * 10) + 31);

    setTimeout(() => {
      window.location.reload();
    }, reloadInterval * 60 * 1000);
  }
});
