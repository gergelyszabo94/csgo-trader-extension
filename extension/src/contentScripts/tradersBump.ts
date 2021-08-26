import { trackEvent } from 'utils/analytics';
import { logExtensionPresence } from 'utils/utilsModular';
import * as fetcher from 'utils/helpers/fetcher';
import * as localStorage from 'utils/helpers/localStorage';

const bump = async () => {
    for (const button of Array.from(document.querySelectorAll('.btn.btn-custom.btn-xs'))) {
        const link = button.getAttribute('href');
        await fetcher.get(link);
    }

    await trackEvent({
        type: 'event',
        action: 'TradersBump',
    });
};

logExtensionPresence();

(async () => {
    await trackEvent({
        type: 'pageview',
        action: 'TradersTradesView',
    });

    const result = await localStorage.get('tradersBump');
    const tradersBump: boolean = result.tradersBump;
    if (tradersBump) {
        // redirects form the "The page you were looking for doesn't exist." page
        if (window.location.href.includes('cf_chl_jschl_tk')) {
            window.location.href = 'https://csgotraders.net/mytrades';
        }
        // ugly way to wait for the trades to load and become "bumpable"
        setTimeout(async () => {
            await bump();
        }, 2000);

        const reloadInterval = Math.floor(Math.random() * 10 + 31) * 60 * 1000;

        setTimeout(() => {
            window.location.reload();
        }, reloadInterval);
    }
})();
