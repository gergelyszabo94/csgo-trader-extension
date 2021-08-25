import { getSessionID } from 'utils/utilsModular';
import { getSteamWalletInfo } from 'utils/pricing';
import * as fetcher from 'utils/requestUtils';

export const buyListing = async (listing, buyerKYC) => {
    try {
        const currencyID = listing.converted_currencyid - 2000;
        const response = await fetcher.post(`https://steamcommunity.com/market/buylisting/${listing.listingid}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            form: {
                sessionid: getSessionID(),
                currency: currencyID,
                fee: listing.converted_fee,
                subtotal: listing.converted_price,
                total: listing.converted_fee + listing.converted_price,
                quantity: 1,
                first_name: buyerKYC.first_name,
                last_name: buyerKYC.last_name,
                billing_address: buyerKYC.billing_address,
                billing_address_two: buyerKYC.billing_address_two,
                billing_country: buyerKYC.billing_country,
                billing_city: buyerKYC.billing_city,
                billing_state: buyerKYC.billing_state,
                billing_postal_code: buyerKYC.billing_postal_code,
                save_my_address: 1,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }
    } catch (err) {
        console.log(err);
    }
};

export const removeListing = async (listingID) => {
    try {
        const response = await fetcher.post(`https://steamcommunity.com/market/removelisting/${listingID}`, {
            form: { sessionid: getSessionID() },
        });
        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }
    } catch (err) {
        console.log(err);
    }
};

// works around the different behavior when fetching from chromium or ff
// This is accomplished by exposing more privileged XHR and
// fetch instances in the content script,
// which has the side-effect of not setting the Origin and
// Referer headers like a request from the page itself would;
// this is often preferable to prevent the request from revealing its cross-orign nature.
// In Firefox, extensions that need to perform requests that behave as if they were
// sent by the content itself can use  content.XMLHttpRequest and content.fetch() instead.
// For cross-browser extensions, the presence of these methods must be feature-detected.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch

export const listItem = async (appID, contextID, amount, assetID, price) => {
    try {
        const response = await fetcher.post('https://steamcommunity.com/market/sellitem/', {
            form: {
                sessionid: getSessionID(),
                appid: appID,
                contextid: contextID,
                amount: amount,
                assetid: assetID,
                price: price,
            },
        });

        console.log(response);
        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return;
        }
        const data = await response.json();
        if (data.success) {
            return data;
        }
    } catch (err) {
        console.log(err);
    }
};

export const createOrder = async (
    appID,
    marketHashName,
    price,
    quantity,
    buyerKYC = {
        billing_address: '',
        billing_address_two: '',
        billing_city: '',
        billing_country: '',
        billing_postal_code: '',
        billing_state: '',
        first_name: '',
        last_name: '',
    },
) => {
    try {
        const currency = getSteamWalletInfo().wallet_currency;
        const response = await fetcher.post('https://steamcommunity.com/market/createbuyorder/', {
            form: {
                sessionid: getSessionID(),
                currency,
                appid: appID,
                market_hash_name: marketHashName,
                price_total: price * quantity,
                quantity: quantity,
                first_name: buyerKYC.first_name,
                last_name: buyerKYC.last_name,
                billing_address: buyerKYC.billing_address,
                billing_address_two: buyerKYC.billing_address_two,
                billing_country: buyerKYC.billing_country,
                billing_city: buyerKYC.billing_city,
                billing_state: buyerKYC.billing_state,
                billing_postal_code: buyerKYC.billing_postal_code,
                save_my_address: 1,
            },
        });

        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return;
        }
        const data = await response.json();
        if (data.success === 1) {
            return data;
        }
    } catch (err) {
        console.log(err);
    }
};

export const cancelOrder = async (orderID) => {
    try {
        const response = await fetcher.post('https://steamcommunity.com/market/cancelbuyorder/', {
            form: {
                sessionid: getSessionID(),
                buy_orderid: orderID,
            },
        });

        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return;
        }
    } catch (err) {
        console.log(err);
    }
};

interface MarketHistory {
    success: boolean;
    pagesize: number;
    total_count: null | number;
    start: number;
    assets: Assets;
    hovers: string;
    results_html: string;
}

interface Assets {
    [key: string]: Context;
}

interface Context {
    [key: string]: Asset;
}

interface Asset {
    currency: number;
    appid: number;
    contextid: string;
    id: string;
    classid: string;
    instanceid: string;
    amount: string;
    status: number;
    original_amount: string;
    unowned_id: string;
    unowned_contextid: string;
    background_color: string;
    icon_url: string;
    icon_url_large: string;
    descriptions: Description[];
    tradable: number;
    actions: OwnerAction[];
    owner_actions: OwnerAction[];
    name: string;
    type: string;
    market_name: string;
    market_hash_name: string;
    market_fee_app: number;
    commodity: number;
    market_tradable_restriction: number;
    market_marketable_restriction: number;
    marketable: number;
    app_icon: string;
    owner: number;
}

interface OwnerAction {
    link: string;
    name: string;
}

interface Description {
    value: string;
    type?: string;
    color?: string;
}

export const getMarketHistory = async (start: number, count: number): Promise<MarketHistory> => {
    try {
        const response = await fetcher.post(`https://steamcommunity.com/market/myhistory/`, {
            params: { start, count },
            form: { sessionid: getSessionID() },
        });

        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return;
        }
        const data = await response.json() as MarketHistory;
        if (data && data.success) {
            return data;
        }
    } catch (err) {
        console.log(err);
    }
};

export const loadItemOrderHistogram = async (nameID) => {
    try {
        const steamWalletInfo = getSteamWalletInfo();
        const currencyCode = steamWalletInfo !== null ? steamWalletInfo.wallet_currency : 1;

        const response = await fetcher.get(`https://steamcommunity.com/market/itemordershistogram`, {
            params: {
                country: 'US',
                language: 'english',
                two_factor: 0,
                currency: currencyCode,
                item_nameid: nameID,
            },
        });

        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
            return;
        }
        const data = await response.json();
        if (data && data.success === 1) {
            return data;
        }
    } catch (err) {
        console.log(err);
    }
};
