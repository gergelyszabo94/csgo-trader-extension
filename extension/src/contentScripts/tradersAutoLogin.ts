import * as localStorage from 'utils/helpers/localStorage';

(async () => {
    const result = await localStorage.get('csgotradersAutoLogin');
    const csgotradersAutoLogin: boolean = result.csgotradersAutoLogin;

    if (csgotradersAutoLogin) {
        // redirects to the trades page after login
        if (document.referrer.includes('steamcommunity.com/openid/login'))
            window.location.href = 'https://csgotraders.net/mytrades';

        const loginViaSteamButton = document.querySelector<HTMLElement>('a[href="/auth/steam"]');

        if (loginViaSteamButton) {
            loginViaSteamButton.click();
        }
    }
})();
