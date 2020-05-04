import { getSessionID } from 'utils/utilsModular';

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

    fetch(request).then((response) => {
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

    fetch(request).then((response) => {
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

    fetch(request).then((response) => {
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

    fetch(request).then((response) => {
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

export {
  removeListing, cancelOrder, getMarketHistory, listItem,
};
