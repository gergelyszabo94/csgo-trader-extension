chrome.storage.local.get('csgotradersAutoLogin', (result) => {
    if (result.csgotradersAutoLogin) {
        // redirects to the trades page after login
        if (document.referrer.includes('steamcommunity.com/openid/login'))
            window.location.href = 'https://csgotraders.net/mytrades';

        const loginViaSteamButton = document.querySelector('a[href="/auth/steam"]');
        if (loginViaSteamButton !== null) loginViaSteamButton.click();
    }
});
