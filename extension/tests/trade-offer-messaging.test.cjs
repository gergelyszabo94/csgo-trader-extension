const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const babel = require('@babel/core');
const parser = require('@babel/parser');

const loadModule = (file, globals, modules = {}) => {
  const filename = path.join(__dirname, '..', 'src', ...file.split('\\'));
  const source = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    configFile: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  }).code;
  const exports = {};
  const context = {
    exports, console, Request, ...globals,
    require: (name) => modules[name] || {},
  };
  vm.runInNewContext(source, context, { filename });
  return exports;
};

test('page token refresh waits for validation and storage before resolving', async () => {
  let validationCallback;
  let storageCallback;
  let stored;
  const chrome = {
    runtime: { sendMessage: (message, callback) => { validationCallback = callback; } },
    storage: { local: {
      get: (keys, callback) => callback({ steamAcessTokenValid: false }),
      set: (value, callback) => { stored = value; storageCallback = callback; },
    } },
  };
  const document = { getElementById: () => ({ getAttribute: () => '"new-token"' }) };
  const { refreshSteamAccessToken } = loadModule('utils\\utilsModular.js', { chrome, document });
  let finished = false;
  const refresh = refreshSteamAccessToken().then(() => { finished = true; });
  await Promise.resolve();
  assert.equal(finished, false);
  validationCallback({ valid: true });
  assert.equal(stored.steamAcessToken, 'new-token');
  await Promise.resolve();
  assert.equal(finished, false);
  storageCallback();
  await refresh;
  assert.equal(finished, true);
});

test('missing page token or background response does not throw', async () => {
  let calls = 0;
  const chrome = {
    runtime: { sendMessage: (message, callback) => { calls += 1; callback(undefined); } },
    storage: { local: { get: (keys, callback) => callback({ steamAcessTokenValid: false }) } },
  };
  let token = null;
  const document = { getElementById: () => ({ getAttribute: () => token }) };
  const { refreshSteamAccessToken } = loadModule('utils\\utilsModular.js', { chrome, document });
  await refreshSteamAccessToken();
  assert.equal(calls, 0);
  token = '"new-token"';
  await refreshSteamAccessToken();
  assert.equal(calls, 1);
});

test('trade offers recover an absent token before requesting Steam', async () => {
  let releaseToken;
  const urls = [];
  const chrome = { storage: { local: { get: (keys, callback) => callback({ steamAcessTokenValid: false }) } } };
  const fetch = async (request) => {
    urls.push(request.url);
    return { ok: true, json: async () => ({ response: { trade_offers_received: [] } }) };
  };
  const modules = { 'utils/utilsModular': {
    setAccessTokenFirstTime: () => new Promise((resolve) => { releaseToken = resolve; }),
  } };
  const { getTradeOffers } = loadModule('utils\\IEconService.js', { chrome, fetch }, modules);
  const result = getTradeOffers(1, 0, 1, 1, 1);
  assert.equal(urls.length, 0);
  releaseToken('recovered-token');
  assert.equal((await result).trade_offers_received.length, 0);
  const url = new URL(urls[0]);
  assert.equal(url.searchParams.get('access_token'), 'recovered-token');
  assert.equal(url.searchParams.get('historical_only'), '0');
});

test('trade offers retry once after an expired token and report recovery failure', async () => {
  const urls = [];
  let recoveredToken = 'fresh-token';
  const chrome = { storage: { local: { get: (keys, callback) => callback({
    steamAcessTokenValid: true, steamAcessToken: 'expired-token', steamAcessTokenSource: 'community-cookie',
  }) } } };
  const fetch = async (request) => {
    urls.push(request.url);
    if (urls.length % 2 === 1) return { ok: false, status: 403 };
    return { ok: true, json: async () => ({ response: {} }) };
  };
  const modules = { 'utils/utilsModular': {
    setAccessTokenFirstTime: async () => recoveredToken, isSteamAccessTokenExpiring: () => false,
  } };
  const { getTradeOffers } = loadModule('utils\\IEconService.js', { chrome, fetch }, modules);
  await getTradeOffers(1, 0, 1, 1, 1);
  assert.equal(new URL(urls[1]).searchParams.get('access_token'), 'fresh-token');
  recoveredToken = null;
  await assert.rejects(getTradeOffers(1, 0, 1, 1, 1), (error) => error === 'access_token_invalid');
  assert.equal(urls.length, 3);
});

test('trade offers renew an expiring cached token before making the API request', async () => {
  let newToken = 'fresh-token';
  const urls = [];
  const chrome = { storage: { local: { get: (keys, callback) => callback({
    steamAcessTokenValid: true, steamAcessToken: 'old-token', steamAcessTokenSource: 'community-cookie',
  }) } } };
  const fetch = async (request) => {
    urls.push(request.url);
    return { ok: true, json: async () => ({ response: {} }) };
  };
  const modules = { 'utils/utilsModular': {
    setAccessTokenFirstTime: async () => newToken, isSteamAccessTokenExpiring: () => true,
  } };
  const { getTradeOffers } = loadModule('utils\\IEconService.js', { chrome, fetch }, modules);
  await getTradeOffers(1, 0, 1, 1, 1);
  assert.equal(new URL(urls[0]).searchParams.get('access_token'), 'fresh-token');
  newToken = null;
  await assert.rejects(getTradeOffers(1, 0, 1, 1, 1), (error) => error === 'access_token_invalid');
  assert.equal(urls.length, 1);
});

test('trade offers retry after a 401 response', async () => {
  const urls = [];
  const chrome = { storage: { local: { get: (keys, callback) => callback({
    steamAcessTokenValid: true, steamAcessToken: 'old-token', steamAcessTokenSource: 'community-cookie',
  }) } } };
  const fetch = async (request) => {
    urls.push(request.url);
    if (urls.length === 1) return { ok: false, status: 401 };
    return { ok: true, json: async () => ({ response: {} }) };
  };
  const modules = { 'utils/utilsModular': {
    setAccessTokenFirstTime: async () => 'fresh-token', isSteamAccessTokenExpiring: () => false,
  } };
  const { getTradeOffers } = loadModule('utils\\IEconService.js', { chrome, fetch }, modules);
  await getTradeOffers(1, 0, 1, 1, 1);
  assert.equal(new URL(urls[1]).searchParams.get('access_token'), 'fresh-token');
});

test('trade history waits for token recovery and retries a rejected token', async () => {
  let releaseToken;
  let recoveryCount = 0;
  const urls = [];
  const chrome = { storage: { local: { get: (keys, callback) => callback({ steamAcessTokenValid: false }) } } };
  const fetch = async (request) => {
    urls.push(request.url);
    if (urls.length === 1) return { ok: false, status: 403 };
    return { ok: true, json: async () => ({ response: {
      trades: [{ steamid_other: 'partner', tradeid: '123', time_init: 456 }],
      total_trades: 1,
    } }) };
  };
  const modules = {
    'utils/utilsModular': {
      setAccessTokenFirstTime: () => {
        recoveryCount += 1;
        if (recoveryCount === 1) return new Promise((resolve) => { releaseToken = resolve; });
        return Promise.resolve('fresh-token');
      },
    },
    'utils/ISteamUser': { getPlayerSummaries: async () => ({}) },
    'utils/pricing': { prettyPrintPrice: () => '' },
    './simpleUtils': { getFormattedPLPercentage: () => '' },
  };
  const { getTradeHistory } = loadModule('utils\\IEconService.js', { chrome, fetch }, modules);
  const result = getTradeHistory(10);
  assert.equal(urls.length, 0);
  releaseToken('first-token');
  assert.equal((await result).lastTradeID, '123');
  assert.equal(recoveryCount, 2);
  assert.equal(new URL(urls[0]).searchParams.get('access_token'), 'first-token');
  const retryUrl = new URL(urls[1]);
  assert.equal(retryUrl.searchParams.get('access_token'), 'fresh-token');
  assert.equal(retryUrl.searchParams.get('include_total'), '1');
  assert.equal(retryUrl.searchParams.get('language'), 'english');
});

test('trade history reports failed recovery and stops after a second 403', async () => {
  let token = null;
  let requests = 0;
  const chrome = { storage: { local: { get: (keys, callback) => callback({
    steamAcessTokenValid: true, steamAcessToken: 'expired-token', steamAcessTokenSource: 'community-cookie',
  }) } } };
  const fetch = async () => { requests += 1; return { ok: false, status: 403 }; };
  const modules = { 'utils/utilsModular': {
    setAccessTokenFirstTime: async () => token, isSteamAccessTokenExpiring: () => false,
  } };
  const { getTradeHistory } = loadModule('utils\\IEconService.js', {
    chrome, fetch, console: { log: () => {} },
  }, modules);
  await assert.rejects(getTradeHistory(10), (error) => error === 'access_token_invalid');
  assert.equal(requests, 1);
  token = 'fresh-token';
  await assert.rejects(getTradeHistory(10), (error) => error === 'access_token_invalid');
  assert.equal(requests, 3);
});

test('trade offers replace legacy and Store cached tokens before requesting Steam', async () => {
  let tokenRequests = 0;
  let source;
  const chrome = { storage: { local: { get: (keys, callback) => callback({
    steamAcessTokenValid: true, steamAcessToken: 'legacy-token', steamAcessTokenSource: source,
  }) } } };
  const fetch = async (request) => {
    assert.equal(new URL(request.url).searchParams.get('access_token'), 'cookie-token');
    return { ok: true, json: async () => ({ response: {} }) };
  };
  const modules = { 'utils/utilsModular': { setAccessTokenFirstTime: async () => {
    tokenRequests += 1;
    return 'cookie-token';
  } } };
  const { getTradeOffers } = loadModule('utils\\IEconService.js', { chrome, fetch }, modules);
  await getTradeOffers(1, 0, 1, 1, 1);
  source = 'store';
  await getTradeOffers(1, 0, 1, 1, 1);
  assert.equal(tokenRequests, 2);
});

test('offer message failures reject and missing offer lists become empty arrays', async () => {
  const filename = path.join(__dirname, '..', 'src', 'contentScripts', 'steam', 'tradeOffers.js');
  const source = fs.readFileSync(filename, 'utf8');
  const ast = parser.parse(source, { sourceType: 'module' });
  const declaration = ast.program.body.find((node) => node.type === 'VariableDeclaration'
    && node.declarations.some((item) => item.id.name === 'getOffersFromAPI'));
  let response;
  const chrome = { runtime: { sendMessage: (message, callback) => callback(response) } };
  const getOffersFromAPI = vm.runInNewContext(
    `${source.slice(declaration.start, declaration.end)}\ngetOffersFromAPI`,
    { chrome, console },
  );
  await assert.rejects(getOffersFromAPI('active'), (error) => error === 'steamError');
  response = { accessTokenValid: false };
  await assert.rejects(getOffersFromAPI('active'), (error) => error === 'accessTokenInvalid');
  response = { offers: {}, items: [] };
  const result = await getOffersFromAPI('active');
  assert.equal(result.offers.trade_offers_received.length, 0);
  assert.equal(result.offers.trade_offers_sent.length, 0);
  response = { offers: {}, items: undefined };
  await assert.rejects(getOffersFromAPI('active'), (error) => error === 'steamError');
});

test('Community cookie recovery validates token identity', async () => {
  const communityID = '76561198000000000';
  const makeToken = (id) => `header.${Buffer.from(JSON.stringify({ sub: id })).toString('base64url')}.signature`;
  const token = makeToken(communityID);
  let value = `${communityID}%7C%7C${token}`;
  let rejectTradeToken = false;
  const writes = [];
  const logged = [];
  const chrome = {
    runtime: {},
    cookies: { get: (details, callback) => {
      assert.equal(details.url, 'https://steamcommunity.com/');
      assert.equal(details.name, 'steamLoginSecure');
      callback(value ? { value } : null);
    } },
    storage: { local: { set: (data, callback) => { writes.push(data); callback(); } } },
  };
  const fetch = async (input, options) => {
    if (input === 'https://steamcommunity.com/') {
      assert.equal(options.credentials, 'include');
      assert.match(options.headers.Accept, /text\/html/);
      return { ok: true };
    }
    assert.ok(input.url.includes('/IEconService/GetTradeOffers/'));
    if (rejectTradeToken) return { ok: false, status: 403 };
    return { ok: true, json: async () => ({ response: {} }) };
  };
  const { setAccessTokenFirstTime } = loadModule('utils\\utilsModular.js', {
    chrome, fetch, atob, console: { log: (...args) => logged.push(args) },
  });
  assert.equal(await setAccessTokenFirstTime(), token);
  assert.equal(writes[0].steamAcessToken, token);
  assert.equal(writes[0].steamAcessTokenSource, 'community-cookie');
  rejectTradeToken = true;
  assert.equal(await setAccessTokenFirstTime(), null);
  rejectTradeToken = false;
  value = `${communityID}||${makeToken('76561198000000001')}`;
  assert.equal(await setAccessTokenFirstTime(), null);
  value = `${communityID}%7C%7Cmalformed.token.signature`;
  assert.equal(await setAccessTokenFirstTime(), null);
  value = '%broken';
  assert.equal(await setAccessTokenFirstTime(), null);
  value = null;
  assert.equal(await setAccessTokenFirstTime(), null);
  assert.equal(writes.length, 1);
  assert.ok(logged.every((args) => args.every((entry) => !String(entry).includes(token))));
});

test('Community renewal reads the cookie after the background page request', async () => {
  const communityID = '76561198000000000';
  const makeToken = (id) => `header.${Buffer.from(JSON.stringify({ sub: id })).toString('base64url')}.signature`;
  const oldToken = makeToken('76561198000000001');
  const newToken = makeToken(communityID);
  let cookieValue = `${communityID}||${oldToken}`;
  let sessionAvailable = true;
  let cookieReads = 0;
  const chrome = {
    runtime: {},
    cookies: { get: (details, callback) => {
      cookieReads += 1;
      callback({ value: cookieValue });
    } },
    storage: { local: { set: (data, callback) => callback() } },
  };
  const fetch = async (input, options) => {
    if (input === 'https://steamcommunity.com/') {
      assert.equal(options.credentials, 'include');
      if (!sessionAvailable) return { ok: false, status: 503 };
      cookieValue = `${communityID}||${newToken}`;
      return { ok: true };
    }
    assert.equal(new URL(input.url).searchParams.get('access_token'), newToken);
    return { ok: true, json: async () => ({ response: {} }) };
  };
  const { setAccessTokenFirstTime } = loadModule('utils\\utilsModular.js', {
    chrome, fetch, atob, console: { log: () => {} },
  });
  assert.equal(await setAccessTokenFirstTime(), newToken);
  assert.equal(cookieReads, 1);
  sessionAvailable = false;
  assert.equal(await setAccessTokenFirstTime(), null);
  assert.equal(cookieReads, 1);
});

test('Steam token expiry check renews within five minutes', () => {
  const now = Math.floor(Date.now() / 1000);
  class FixedDate extends Date {
    static now() { return now * 1000; }
  }
  const { isSteamAccessTokenExpiring } = loadModule('utils\\utilsModular.js', {
    chrome: { runtime: {} }, atob, Date: FixedDate, console: { log: () => {} },
  });
  const token = (seconds) => `header.${Buffer.from(JSON.stringify({ exp: seconds })).toString('base64url')}.signature`;
  assert.equal(isSteamAccessTokenExpiring(token(now + 301)), false);
  assert.equal(isSteamAccessTokenExpiring(token(now + 300)), true);
  assert.equal(isSteamAccessTokenExpiring(token(now + 299)), true);
  assert.equal(isSteamAccessTokenExpiring(token(now - 1)), true);
  assert.equal(isSteamAccessTokenExpiring('invalid'), true);
});

test('an expired cached token triggers Community recovery before fetching offers', async () => {
  const communityID = '76561198000000000';
  const makeToken = (exp) => `header.${Buffer.from(JSON.stringify({ sub: communityID, exp })).toString('base64url')}.signature`;
  const initialTime = 1800000000;
  const oldToken = makeToken(initialTime + 3600);
  const newToken = makeToken(initialTime + 7200);
  let now = initialTime * 1000;
  class SimulatedDate extends Date {
    static now() { return now; }
  }
  const storage = {
    steamAcessToken: oldToken,
    steamAcessTokenValid: true,
    steamAcessTokenSource: 'community-cookie',
  };
  let cookieToken = oldToken;
  const events = [];
  const chrome = {
    runtime: {},
    cookies: { get: (details, callback) => {
      events.push('cookie');
      assert.equal(details.name, 'steamLoginSecure');
      callback({ value: `${communityID}||${cookieToken}` });
    } },
    storage: { local: {
      get: (keys, callback) => callback({ ...storage }),
      set: (data, callback) => {
        events.push('save');
        Object.assign(storage, data);
        callback();
      },
    } },
  };
  const fetch = async (input, options) => {
    if (input === 'https://steamcommunity.com/') {
      events.push('community');
      assert.equal(options.credentials, 'include');
      cookieToken = newToken;
      return { ok: true };
    }
    const url = new URL(input.url);
    const token = url.searchParams.get('access_token');
    assert.match(url.pathname, /\/IEconService\/GetTradeOffers\//);
    assert.ok(token === oldToken || token === newToken);
    events.push(token === oldToken ? 'old offer request' : 'new offer request');
    return { ok: true, json: async () => ({ response: { trade_offers_received: [] } }) };
  };
  const globals = { chrome, fetch, atob, Date: SimulatedDate };
  const tokenUtils = loadModule('utils\\utilsModular.js', globals);
  const { getTradeOffers } = loadModule('utils\\IEconService.js', globals, {
    'utils/utilsModular': tokenUtils,
  });

  await getTradeOffers(1, 0, 1, 1, 1);
  assert.deepEqual(events, ['old offer request']);

  events.length = 0;
  now += 3601 * 1000;
  const offers = await getTradeOffers(1, 0, 1, 1, 1);
  assert.deepEqual(events, ['community', 'cookie', 'new offer request', 'save', 'new offer request']);
  assert.equal(storage.steamAcessToken, newToken);
  assert.equal(storage.steamAcessTokenValid, true);
  assert.equal(offers.trade_offers_received.length, 0);
});

test('Community login cookie changes invalidate the cached token', () => {
  const filename = path.join(__dirname, '..', 'src', 'backgroundScripts', 'background.js');
  const source = fs.readFileSync(filename, 'utf8');
  const ast = parser.parse(source, { sourceType: 'module' });
  const registration = ast.program.body.find((node) => node.type === 'IfStatement'
    && source.slice(node.start, node.end).startsWith('if (chrome.cookies?.onChanged)'));
  let handler;
  const writes = [];
  const chrome = {
    runtime: {},
    cookies: { onChanged: { addListener: (listener) => { handler = listener; } } },
    storage: { local: { set: (data, callback) => { writes.push(data); callback(); } } },
  };
  vm.runInNewContext(source.slice(registration.start, registration.end), { chrome, console });
  handler({ cookie: { name: 'other', domain: 'steamcommunity.com' } });
  handler({ cookie: { name: 'steamLoginSecure', domain: 'store.steampowered.com' } });
  assert.equal(writes.length, 0);
  handler({ cookie: { name: 'steamLoginSecure', domain: '.steamcommunity.com' } });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].steamAcessTokenValid, false);
});

test('inventory enrichment propagates float-cache and pricing failures', async () => {
  const cacheError = new Error('float cache failed');
  const pricingError = new Error('pricing failed');
  let failCache = true;
  const chrome = { storage: { local: { get: (keys, callback) => callback({
    itemPricing: true,
  }) } } };
  const modules = {
    'utils/floatCaching': {
      getFloatInfoFromCache: () => (failCache ? Promise.reject(cacheError) : Promise.resolve({})),
    },
    'utils/pricing': { getCustomPrice: () => { throw pricingError; } },
  };
  const addPricesAndFloatsToInventory = loadModule('utils\\addPricesAndFloats.js', { chrome }, modules).default;
  await assert.rejects(addPricesAndFloatsToInventory([{ assetid: '1' }]), (error) => error === cacheError);
  failCache = false;
  await assert.rejects(addPricesAndFloatsToInventory([{ assetid: '1' }]), (error) => error === pricingError);
});

test('concurrent offscreen requests share document creation', async () => {
  let createCount = 0;
  let finishCreation;
  const chrome = {
    runtime: { getURL: () => 'chrome-extension://test/index.html' },
    offscreen: {
      hasDocument: async () => false,
      createDocument: () => {
        createCount += 1;
        return new Promise((resolve) => { finishCreation = resolve; });
      },
    },
  };
  const { createOffscreen } = loadModule('utils\\simpleUtils.js', { chrome });
  const first = createOffscreen(['DOM_PARSER'], 'test');
  const second = createOffscreen(['DOM_PARSER'], 'test');
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(createCount, 1);
  finishCreation();
  await Promise.all([first, second]);
});
