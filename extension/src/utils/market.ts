import { getSessionID } from 'utils/utilsModular';
import { getSteamWalletInfo } from 'utils/pricing';

const buyListing = (listing, buyerKYC) => {
    return new Promise((resolve, reject) => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        const currencyID = listing.converted_currencyid - 2000;
        const request = new Request(
            `https://steamcommunity.com/market/buylisting/${listing.listingid}`,
            {
                method: 'POST',
                headers: myHeaders,
                body: `sessionid=${getSessionID()}&currency=${currencyID}&fee=${
                    listing.converted_fee
                }&subtotal=${listing.converted_price}&total=${
                    listing.converted_fee + listing.converted_price
                }&quantity=1&first_name=${buyerKYC.first_name}&last_name=${
                    buyerKYC.last_name
                }&billing_address=${buyerKYC.billing_address}&billing_address_two=${
                    buyerKYC.billing_address_two
                }&billing_country=${buyerKYC.billing_country}&billing_city=${
                    buyerKYC.billing_city
                }&billing_state=${buyerKYC.billing_state}&billing_postal_code=${
                    buyerKYC.billing_postal_code
                }&save_my_address=1`,
                credentials: 'include',
            },
        );

        //@ts-ignore
        const fetchFunction = window.content !== undefined ? window.content.fetch : fetch;

        fetchFunction(request)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject({ status: response.status, statusText: response.statusText });
                } else resolve('success');
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
};

const removeListing = (listingID) => {
    return new Promise((resolve, reject) => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        const request = new Request(
            `https://steamcommunity.com/market/removelisting/${listingID}`,
            {
                method: 'POST',
                headers: myHeaders,
                body: `sessionid=${getSessionID()}`,
            },
        );

        //@ts-ignore
        const fetchFunction = window.content !== undefined ? window.content.fetch : fetch;

        fetchFunction(request)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject({ status: response.status, statusText: response.statusText });
                } else resolve('success');
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
};

const listItem = (appID, contextID, amount, assetID, price) => {
    return new Promise((resolve, reject) => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        const request = new Request('https://steamcommunity.com/market/sellitem/', {
            method: 'POST',
            headers: myHeaders,
            body: `sessionid=${getSessionID()}&appid=${appID}&contextid=${contextID}&amount=${amount}&assetid=${assetID}&price=${price}`,
        });

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
        //@ts-ignore
        const fetchFunction = window.content !== undefined ? window.content.fetch : fetch;

        fetchFunction(request)
            .then((response) => {
                console.log(response);
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject({ status: response.status, statusText: response.statusText });
                } else return response.json();
            })
            .then((body) => {
                if (body.success) {
                    resolve(body);
                } else reject(body);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
};

const createOrder = (
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
    return new Promise((resolve, reject) => {
        const currency = getSteamWalletInfo().wallet_currency;
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        const request = new Request('https://steamcommunity.com/market/createbuyorder/', {
            method: 'POST',
            headers: myHeaders,
            body: `sessionid=${getSessionID()}&currency=${currency}&appid=${appID}&market_hash_name=${marketHashName}&price_total=${
                price * quantity
            }&quantity=${quantity}&first_name=${buyerKYC.first_name}&last_name=${
                buyerKYC.last_name
            }&billing_address=${buyerKYC.billing_address}&billing_address_two=${
                buyerKYC.billing_address_two
            }&billing_country=${buyerKYC.billing_country}&billing_city=${
                buyerKYC.billing_city
            }&billing_state=${buyerKYC.billing_state}&billing_postal_code=${
                buyerKYC.billing_postal_code
            }&save_my_address=1`,
        });

        //@ts-ignore
        const fetchFunction = window.content !== undefined ? window.content.fetch : fetch;

        fetchFunction(request)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject({ status: response.status, statusText: response.statusText });
                }
                return response.json();
            })
            .then((responseJSON) => {
                if (responseJSON === null) reject('Error placing buy order!');
                else if (responseJSON.success === 1) resolve(responseJSON);
                else reject(responseJSON.message);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
};

const cancelOrder = (orderID) => {
    return new Promise((resolve, reject) => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        const request = new Request('https://steamcommunity.com/market/cancelbuyorder/', {
            method: 'POST',
            headers: myHeaders,
            body: `sessionid=${getSessionID()}&buy_orderid=${orderID}`,
        });

        //@ts-ignore
        const fetchFunction = window.content !== undefined ? window.content.fetch : fetch;

        fetchFunction(request)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject({ status: response.status, statusText: response.statusText });
                } else resolve('success');
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
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
    [key: string]: Context
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
    actions: Owneraction[];
    owner_actions: Owneraction[];
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

interface Owneraction {
    link: string;
    name: string;
}

interface Description {
    value: string;
    type?: string;
    color?: string;
}

const getMarketHistory = (start: number, count: number): Promise<MarketHistory> => {
    return new Promise((resolve, reject) => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        const request = new Request(
            `https://steamcommunity.com/market/myhistory/?start=${start}&count=${count}`,
            {
                method: 'POST',
                headers: myHeaders,
                body: `sessionid=${getSessionID()}`,
            },
        );

        //@ts-ignore
        const fetchFunction = window.content !== undefined ? window.content.fetch : fetch;

        fetchFunction(request)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject({ status: response.status, statusText: response.statusText });
                }
                return response.json();
            })
            .then((historyJSON) => {
                if (historyJSON === null) reject('success:false');
                else if (historyJSON.success === true) resolve(historyJSON as MarketHistory);
                else reject('success:false');
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
};

const loadItemOrderHistogram = (nameID) => {
    return new Promise((resolve, reject) => {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        const steamWalletInfo = getSteamWalletInfo();
        const currencyCode = steamWalletInfo !== null ? steamWalletInfo.wallet_currency : 1;

        const request = new Request(
            `https://steamcommunity.com/market/itemordershistogram?country=US&language=english&two_factor=0&currency=${currencyCode}&item_nameid=${nameID}`,
            {
                method: 'GET',
                headers: myHeaders,
            },
        );

        //@ts-ignore
        const fetchFunction = window.content !== undefined ? window.content.fetch : fetch;

        fetchFunction(request)
            .then((response) => {
                if (!response.ok) {
                    console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    reject({ status: response.status, statusText: response.statusText });
                }
                return response.json();
            })
            .then((historyJSON) => {
                if (historyJSON === null) reject('success:false');
                else if (historyJSON.success === 1) resolve(historyJSON);
                else reject('success:false');
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
};

export {
    removeListing,
    cancelOrder,
    getMarketHistory,
    listItem,
    buyListing,
    createOrder,
    loadItemOrderHistogram,
};
