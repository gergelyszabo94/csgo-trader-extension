import { getSessionID, getAppropriateFetchFunc } from 'utils/utilsModular';
import { getSteamWalletInfo } from 'utils/pricing';

const buyListing = (listing, buyerKYC) => {
  return new Promise((resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    const currencyID = listing.converted_currencyid - 2000;
    const request = new Request(`https://steamcommunity.com/market/buylisting/${listing.listingid}`,
      {
        method: 'POST',
        headers: myHeaders,
        body: `sessionid=${getSessionID()}&currency=${currencyID}&fee=${listing.converted_fee}&subtotal=${listing.converted_price}&total=${listing.converted_fee + listing.converted_price}&quantity=1&first_name=${buyerKYC.first_name}&last_name=${buyerKYC.last_name}&billing_address=${buyerKYC.billing_address}&billing_address_two=${buyerKYC.billing_address_two}&billing_country=${buyerKYC.billing_country}&billing_city=${buyerKYC.billing_city}&billing_state=${buyerKYC.billing_state}&billing_postal_code=${buyerKYC.billing_postal_code}&save_my_address=1`,
        credentials: 'include',
      });

    const fetchFunction = getAppropriateFetchFunc();

    fetchFunction(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
      } else resolve('success');
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

const removeListing = (listingID) => {
  return new Promise((resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    const request = new Request(`https://steamcommunity.com/market/removelisting/${listingID}`,
      {
        method: 'POST',
        headers: myHeaders,
        body: `sessionid=${getSessionID()}`,
      });

    const fetchFunction = getAppropriateFetchFunc();

    fetchFunction(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
      } else resolve('success');
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

const listItem = (appID, contextID, amount, assetID, price) => {
  return new Promise((resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    const request = new Request('https://steamcommunity.com/market/sellitem/',
      {
        method: 'POST',
        headers: myHeaders,
        body: `sessionid=${getSessionID()}&appid=${appID}&contextid=${contextID}&amount=${amount}&assetid=${assetID}&price=${price}`,
      });

    const fetchFunction = getAppropriateFetchFunc();

    fetchFunction(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
      } else return response.json();
    }).then((body) => {
      if (body.success) {
        resolve(body);
      } else reject(body);
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

const createOrder = (appID, marketHashName, price, quantity, buyerKYC = {
  billing_address: '',
  billing_address_two: '',
  billing_city: '',
  billing_country: '',
  billing_postal_code: '',
  billing_state: '',
  first_name: '',
  last_name: '',
}) => {
  return new Promise((resolve, reject) => {
    const currency = getSteamWalletInfo().wallet_currency;
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    const request = new Request('https://steamcommunity.com/market/createbuyorder/',
      {
        method: 'POST',
        headers: myHeaders,
        body: `sessionid=${getSessionID()}&currency=${currency}&appid=${appID}&market_hash_name=${marketHashName}&price_total=${price * quantity}&quantity=${quantity}&first_name=${buyerKYC.first_name}&last_name=${buyerKYC.last_name}&billing_address=${buyerKYC.billing_address}&billing_address_two=${buyerKYC.billing_address_two}&billing_country=${buyerKYC.billing_country}&billing_city=${buyerKYC.billing_city}&billing_state=${buyerKYC.billing_state}&billing_postal_code=${buyerKYC.billing_postal_code}&save_my_address=1`,
      });

    const fetchFunction = getAppropriateFetchFunc();

    fetchFunction(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
      }
      return response.json();
    }).then((responseJSON) => {
      if (responseJSON === null) reject('Error placing buy order!');
      else if (responseJSON.success === 1) resolve(responseJSON);
      else reject(responseJSON.message);
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

const cancelOrder = (orderID) => {
  return new Promise((resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    const request = new Request('https://steamcommunity.com/market/cancelbuyorder/',
      {
        method: 'POST',
        headers: myHeaders,
        body: `sessionid=${getSessionID()}&buy_orderid=${orderID}`,
      });

    const fetchFunction = getAppropriateFetchFunc();

    fetchFunction(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
      } else resolve('success');
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

const getMarketHistory = (start, count) => {
  return new Promise((resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    const request = new Request(`https://steamcommunity.com/market/myhistory/?start=${start}&count=${count}`,
      {
        method: 'POST',
        headers: myHeaders,
        body: `sessionid=${getSessionID()}`,
      });

    const fetchFunction = getAppropriateFetchFunc();

    fetchFunction(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
      }
      return response.json();
    }).then((historyJSON) => {
      if (historyJSON === null) reject('success:false');
      else if (historyJSON.success === true) resolve(historyJSON);
      else reject('success:false');
    }).catch((err) => {
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

    const request = new Request(`https://steamcommunity.com/market/itemordershistogram?country=US&language=english&two_factor=0&currency=${currencyCode}&item_nameid=${nameID}`,
      {
        method: 'GET',
        headers: myHeaders,
      });

    const fetchFunction = getAppropriateFetchFunc();

    fetchFunction(request).then((response) => {
      if (!response.ok) {
        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        reject({ status: response.status, statusText: response.statusText });
      }
      return response.json();
    }).then((historyJSON) => {
      if (historyJSON === null) reject('success:false');
      else if (historyJSON.success === 1) resolve(historyJSON);
      else reject('success:false');
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

export {
  removeListing, cancelOrder, getMarketHistory, listItem,
  buyListing, createOrder, loadItemOrderHistogram,
};
