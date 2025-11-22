# Steam Inventory & Trade Offer API - Detaillierte Dokumentation

## Inhaltsverzeichnis
1. [Inventory Zugriff](#inventory-zugriff)
2. [Trade Offers Verwalten](#trade-offers-verwalten)
3. [Authentifizierung](#authentifizierung)
4. [Praktische Beispiele](#praktische-beispiele)
5. [Wichtige Hinweise](#wichtige-hinweise)

---

## Inventory Zugriff

### Wie Items im Inventar sichtbar sind

Steam lädt standardmäßig **ALLE Items** in den Browser, inklusive trade-locked Items. Die Steam-Website filtert diese Items nur client-seitig aus der Anzeige heraus - die Daten sind aber bereits im Browser vorhanden.

### 1. Inventory API Endpoints

Es gibt **zwei öffentliche Endpoints** um Inventare abzurufen - **KEIN API-Key erforderlich!**

#### Endpoint 1: Moderne Inventory API (empfohlen)
```
GET https://steamcommunity.com/inventory/{STEAM_ID}/730/2/?l=english&count=2000
```

**Parameter:**
- `{STEAM_ID}` - Steam ID im 64-Bit Format (z.B. `76561198012345678`)
- `730` - App ID für CS2/CS:GO
- `2` - Context ID (2 = In-Game Items)
- `count=2000` - Anzahl der Items pro Request (Maximum: 2000)
- `l=english` - Sprache

**Response Struktur:**
```json
{
  "success": 1,
  "total_inventory_count": 150,
  "assets": [
    {
      "appid": 730,
      "contextid": "2",
      "assetid": "27364729461",
      "classid": "310776668",
      "instanceid": "188530139",
      "amount": "1"
    }
  ],
  "descriptions": [
    {
      "appid": 730,
      "classid": "310776668",
      "instanceid": "188530139",
      "market_hash_name": "AK-47 | Redline (Field-Tested)",
      "name": "AK-47 | Redline",
      "type": "Rifle",
      "tradable": 0,
      "marketable": 0,
      "commodity": 0,
      "owner_descriptions": [
        {
          "value": "Tradable/Marketable After Nov 25, 2025 (7:00:00) GMT"
        }
      ],
      "descriptions": [...],
      "icon_url": "...",
      "tags": [...]
    }
  ]
}
```

#### Endpoint 2: Legacy JSON API
```
GET https://steamcommunity.com/profiles/{STEAM_ID}/inventory/json/730/2/?l=english
```

**Response Struktur:**
```json
{
  "success": true,
  "rgInventory": {
    "27364729461": {
      "id": "27364729461",
      "classid": "310776668",
      "instanceid": "188530139",
      "amount": "1",
      "pos": 1
    }
  },
  "rgDescriptions": {
    "310776668_188530139": {
      "appid": 730,
      "classid": "310776668",
      "market_hash_name": "AK-47 | Redline (Field-Tested)",
      "tradable": 0,
      "marketable": 0,
      "owner_descriptions": [...]
    }
  }
}
```

### 2. Trade-Lock Informationen Erkennen

Items die trade-locked sind haben folgende Eigenschaften:

```json
{
  "tradable": 0,
  "marketable": 0,
  "owner_descriptions": [
    {
      "value": "Tradable/Marketable After Nov 25, 2025 (7:00:00) GMT"
    }
  ]
}
```

**Oder bei transferred Items:**
```json
{
  "owner_descriptions": [
    {
      "value": "This item can be transferred until Nov 30, 2025 (7:00:00) GMT"
    }
  ]
}
```

**Reguläre tradable Items:**
```json
{
  "tradable": 1,
  "marketable": 1
}
```

### 3. Authentifizierung für Inventory Zugriff

**Wichtig:** Inventory Endpoints funktionieren nur mit Browser-Session-Cookies!

#### Benötigte Cookies:
- `steamLoginSecure` - Hauptauthentifizierungs-Cookie
- `sessionid` - Session-ID

#### Cookies Extrahieren:

**Option A: Manuell aus Browser**
1. In Steam einloggen
2. Browser DevTools öffnen (F12)
3. Application/Storage → Cookies → `https://steamcommunity.com`
4. Cookies kopieren: `steamLoginSecure` und `sessionid`

**Option B: Programmatisch (Node.js mit Puppeteer)**
```javascript
const puppeteer = require('puppeteer');

async function getSteamCookies() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Login durchführen
  await page.goto('https://steamcommunity.com/login');
  // ... Login-Formular ausfüllen & Steam Guard ...

  // Cookies extrahieren
  const cookies = await page.cookies();
  const steamLoginSecure = cookies.find(c => c.name === 'steamLoginSecure').value;
  const sessionid = cookies.find(c => c.name === 'sessionid').value;

  await browser.close();
  return { steamLoginSecure, sessionid };
}
```

#### Inventory Abrufen mit Cookies:

```javascript
const fetch = require('node-fetch');

async function getInventory(steamID, cookies) {
  const cookieString = `steamLoginSecure=${cookies.steamLoginSecure}; sessionid=${cookies.sessionid}`;

  const response = await fetch(
    `https://steamcommunity.com/inventory/${steamID}/730/2/?l=english&count=2000`,
    {
      headers: {
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 ...'
      }
    }
  );

  const data = await response.json();
  return data;
}
```

### 4. Zugriff über Steam's JavaScript-Objekte (Browser Extension)

Die Extension nutzt Steam's eigene JavaScript-Objekte im Browser:

```javascript
// In der Steam-Website ist das Inventory bereits geladen in:
UserYou.getInventory(appID, contextID)

// Die Extension injiziert JavaScript um darauf zuzugreifen:
const getItemsScript = `
  inventory = UserYou.getInventory(730, 2);
  trimmedAssets = [];

  for (const asset of Object.values(inventory.m_rgAssets)) {
    if (asset.hasOwnProperty('appid')) {
      trimmedAssets.push({
        amount: asset.amount,
        assetid: asset.assetid,
        classid: asset.classid,
        contextid: asset.contextid,
        instanceid: asset.instanceid,
        description: asset.description,
        appid: asset.appid.toString()
      });
    }
  }

  document.querySelector('body').setAttribute('inventoryInfo', JSON.stringify(trimmedAssets));
`;

// Script injizieren und Daten auslesen
const scriptElement = document.createElement('script');
scriptElement.textContent = getItemsScript;
document.documentElement.appendChild(scriptElement);

const inventoryData = JSON.parse(document.querySelector('body').getAttribute('inventoryInfo'));
```

**Wichtig:** Steam lädt initial nur 75 Items (3 Seiten). Um alle Items zu laden:

```javascript
const loadFullInventoryScript = `
  g_ActiveInventory.LoadMoreAssets(1000).done(function () {
    for (let i = 0; i < g_ActiveInventory.m_cPages; i++) {
      g_ActiveInventory.m_rgPages[i].EnsurePageItemsCreated();
      g_ActiveInventory.PreloadPageImages(i);
    }
    document.querySelector('body').setAttribute('allItemsLoaded', true);
  });
`;
```

---

## Trade Offers Verwalten

### 1. Trade Offer Erstellen und Senden

#### Endpoint:
```
POST https://steamcommunity.com/tradeoffer/new/send
```

#### Request Format:

**Headers:**
```
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: steamLoginSecure=YOUR_COOKIE; sessionid=YOUR_SESSION_ID
```

**Body (URL-encoded):**
```
sessionid={SESSION_ID}
&serverid=1
&partner={PARTNER_STEAM_ID}
&tradeoffermessage={MESSAGE}
&json_tradeoffer={TRADE_OFFER_JSON}
&captcha=
&trade_offer_create_params={"trade_offer_access_token":"{TOKEN}"}
```

#### Trade Offer JSON Struktur:

```javascript
const tradeOfferJSON = {
  newversion: true,
  version: 2,
  me: {
    assets: [
      {
        appid: "730",
        contextid: "2",
        amount: 1,
        assetid: "27364729461"  // Asset ID des Items das du anbietest
      },
      {
        appid: "730",
        contextid: "2",
        amount: 1,
        assetid: "27364729462"
      }
    ],
    currency: [],
    ready: false
  },
  them: {
    assets: [
      {
        appid: "730",
        contextid: "2",
        amount: 1,
        assetid: "12345678901"  // Asset ID des Items das du erhalten möchtest
      }
    ],
    currency: [],
    ready: false
  }
};
```

**Vollständiges Beispiel:**

```javascript
async function sendTradeOffer(partnerID, itemsToGive, itemsToReceive, token, message, sessionID) {
  const tradeOfferJSON = {
    newversion: true,
    version: 2,
    me: {
      assets: itemsToGive,  // Array von {appid, contextid, amount, assetid}
      currency: [],
      ready: false
    },
    them: {
      assets: itemsToReceive,
      currency: [],
      ready: false
    }
  };

  const formData = new URLSearchParams({
    sessionid: sessionID,
    serverid: '1',
    partner: partnerID,
    tradeoffermessage: message,
    json_tradeoffer: JSON.stringify(tradeOfferJSON),
    captcha: '',
    trade_offer_create_params: JSON.stringify({ trade_offer_access_token: token })
  });

  const response = await fetch('https://steamcommunity.com/tradeoffer/new/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionID}`
    },
    body: formData.toString()
  });

  const result = await response.json();
  console.log(result);

  return result;
}

// Response:
{
  "tradeofferid": "5847562891",
  "needs_mobile_confirmation": true,
  "needs_email_confirmation": false,
  "email_domain": ""
}
```

### 2. Trade Offer Akzeptieren

#### Endpoint:
```
POST https://steamcommunity.com/tradeoffer/{OFFER_ID}/accept
```

**Headers:**
```
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: steamLoginSecure=YOUR_COOKIE; sessionid=YOUR_SESSION_ID
Referer: https://steamcommunity.com/tradeoffer/{OFFER_ID}/
```

**Body:**
```
sessionid={SESSION_ID}
&serverid=1
&tradeofferid={OFFER_ID}
&partner={PARTNER_ID}
&captcha=
```

**Beispiel:**

```javascript
async function acceptTradeOffer(offerID, partnerID, sessionID) {
  const formData = new URLSearchParams({
    sessionid: sessionID,
    serverid: '1',
    tradeofferid: offerID,
    partner: partnerID,
    captcha: ''
  });

  const response = await fetch(`https://steamcommunity.com/tradeoffer/${offerID}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionID}`,
      'Referer': `https://steamcommunity.com/tradeoffer/${offerID}/`
    },
    body: formData.toString()
  });

  const result = await response.json();
  return result;
}

// Response:
{
  "tradeofferid": "5847562891",
  "needs_mobile_confirmation": true,
  "needs_email_confirmation": false
}
```

### 3. Trade Offer Ablehnen

#### Endpoint:
```
POST https://steamcommunity.com/tradeoffer/{OFFER_ID}/decline
```

**Body:**
```
sessionid={SESSION_ID}
```

**Beispiel:**

```javascript
async function declineTradeOffer(offerID, sessionID) {
  const formData = new URLSearchParams({
    sessionid: sessionID
  });

  const response = await fetch(`https://steamcommunity.com/tradeoffer/${offerID}/decline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionID}`
    },
    body: formData.toString()
  });

  return await response.json();
}
```

### 4. Trade Offer Abbrechen (Stornieren)

#### Endpoint:
```
POST https://steamcommunity.com/tradeoffer/{OFFER_ID}/cancel/
```

**Beispiel:**

```javascript
async function cancelTradeOffer(offerID, sessionID) {
  const formData = new URLSearchParams({
    sessionid: sessionID
  });

  const response = await fetch(`https://steamcommunity.com/tradeoffer/${offerID}/cancel/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie': `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionID}`
    },
    body: formData.toString()
  });

  const result = await response.json();
  return result;  // { "tradeofferid": "5847562891" }
}
```

---

## Authentifizierung

### Benötigte Daten für Trade Offers

#### 1. Session ID

Die Session ID wird von Steam's JavaScript-Variable `g_sessionID` bereitgestellt.

**Im Browser extrahieren:**
```javascript
// Methode 1: Aus Steam's JavaScript
console.log(g_sessionID);

// Methode 2: Aus Cookie
const sessionid = document.cookie.split('; ').find(c => c.startsWith('sessionid=')).split('=')[1];
```

**Server-seitig aus Cookie extrahieren:**
```javascript
const cookieParser = require('cookie');
const cookies = cookieParser.parse(cookieHeader);
const sessionid = cookies.sessionid;
```

#### 2. Steam Login Secure Cookie

Dieser Cookie authentifiziert dich bei Steam.

**Format:** `steamLoginSecure=76561198012345678%7C%7CeyAidHlwIjogIkpXVCIsICJhbGc...`

Der Cookie enthält:
- Deine Steam ID
- JWT Token

**Gültigkeit:** Meist 1-2 Wochen, kann durch "Remember Me" verlängert werden

#### 3. Partner Steam ID

Die Steam ID des Handelspartners im korrekten Format.

**Steam ID Formate:**
- **SteamID64:** `76561198012345678` (verwendet für API Calls)
- **SteamID3:** `[U:1:52079950]`
- **SteamID32:** `STEAM_0:0:26039975`
- **Account ID:** `52079950` (verwendet in Trade Offer URLs)

**Konvertierung von Account ID zu SteamID64:**
```javascript
function accountIDToSteamID64(accountID) {
  return (BigInt(accountID) + BigInt('76561197960265728')).toString();
}

// Beispiel:
const accountID = '52079950';
const steamID64 = accountIDToSteamID64(accountID);  // '76561198012345678'
```

**Aus Trade URL extrahieren:**
```javascript
// Trade URL Format: https://steamcommunity.com/tradeoffer/new/?partner=52079950&token=AbCdEfGh

function parseTradeURL(url) {
  const urlParams = new URLSearchParams(url.split('?')[1]);
  const accountID = urlParams.get('partner');
  const token = urlParams.get('token');

  return {
    accountID,
    steamID64: accountIDToSteamID64(accountID),
    token
  };
}
```

#### 4. Trade Offer Token

Der Token erlaubt dir, Trade Offers an Nicht-Freunde zu senden.

**Wo finden:**
- Trade URL: `https://steamcommunity.com/tradeoffer/new/?partner=XXXXX&token=YYYYYYYY`
- Token ist der `token` Parameter: `YYYYYYYY`

**Eigenen Trade URL Token finden:**
1. Steam öffnen → Inventar
2. "Trade Offers" → "Who can send me Trade Offers?"
3. URL kopieren: `https://steamcommunity.com/tradeoffer/new/?partner=YOUR_ID&token=YOUR_TOKEN`

---

## Praktische Beispiele

### Vollständiges Beispiel: Trade Bot Implementierung

```javascript
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

class SteamTradingBot {
  constructor(steamLoginSecure, sessionid) {
    this.steamLoginSecure = steamLoginSecure;
    this.sessionid = sessionid;
    this.cookieString = `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionid}`;
  }

  // Eigenes Inventory abrufen
  async getMyInventory(steamID) {
    const response = await fetch(
      `https://steamcommunity.com/inventory/${steamID}/730/2/?l=english&count=2000`,
      {
        headers: {
          'Cookie': this.cookieString,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const data = await response.json();
    return this.parseInventory(data);
  }

  // Inventory parsen und Items mit Tradability Info zurückgeben
  parseInventory(inventoryData) {
    const items = [];

    for (const asset of inventoryData.assets) {
      const description = inventoryData.descriptions.find(
        d => d.classid === asset.classid && d.instanceid === asset.instanceid
      );

      let tradability = 'Tradable';
      if (description.tradable === 0 && description.marketable === 0) {
        if (description.owner_descriptions) {
          const tradeableDesc = description.owner_descriptions.find(
            d => d.value.includes('Tradable') || d.value.includes('transferred')
          );
          if (tradeableDesc) {
            tradability = tradeableDesc.value;
          }
        } else {
          tradability = 'Not Tradable';
        }
      }

      items.push({
        assetid: asset.assetid,
        classid: asset.classid,
        instanceid: asset.instanceid,
        name: description.market_hash_name,
        tradable: description.tradable,
        marketable: description.marketable,
        tradability,
        iconURL: `https://community.cloudflare.steamstatic.com/economy/image/${description.icon_url}`
      });
    }

    return items;
  }

  // Trade Offer senden
  async sendTradeOffer(partnerAccountID, token, itemsToGive, itemsToReceive, message = '') {
    const partnerSteamID64 = this.accountIDToSteamID64(partnerAccountID);

    const tradeOfferJSON = {
      newversion: true,
      version: 2,
      me: {
        assets: itemsToGive.map(item => ({
          appid: "730",
          contextid: "2",
          amount: 1,
          assetid: item.assetid
        })),
        currency: [],
        ready: false
      },
      them: {
        assets: itemsToReceive.map(item => ({
          appid: "730",
          contextid: "2",
          amount: 1,
          assetid: item.assetid
        })),
        currency: [],
        ready: false
      }
    };

    const formData = new URLSearchParams({
      sessionid: this.sessionid,
      serverid: '1',
      partner: partnerSteamID64,
      tradeoffermessage: message,
      json_tradeoffer: JSON.stringify(tradeOfferJSON),
      captcha: '',
      trade_offer_create_params: JSON.stringify({ trade_offer_access_token: token })
    });

    const response = await fetch('https://steamcommunity.com/tradeoffer/new/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': this.cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString()
    });

    const result = await response.json();

    if (result.tradeofferid) {
      console.log(`✓ Trade Offer gesendet! ID: ${result.tradeofferid}`);
      if (result.needs_mobile_confirmation) {
        console.log('⚠ Mobile Bestätigung erforderlich!');
      }
    } else {
      console.error('✗ Fehler beim Senden:', result);
    }

    return result;
  }

  // Trade Offer akzeptieren
  async acceptTradeOffer(offerID, partnerID) {
    const formData = new URLSearchParams({
      sessionid: this.sessionid,
      serverid: '1',
      tradeofferid: offerID,
      partner: partnerID,
      captcha: ''
    });

    const response = await fetch(`https://steamcommunity.com/tradeoffer/${offerID}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': this.cookieString,
        'Referer': `https://steamcommunity.com/tradeoffer/${offerID}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString()
    });

    const result = await response.json();

    if (result.tradeofferid) {
      console.log(`✓ Trade Offer akzeptiert! ID: ${result.tradeofferid}`);
      if (result.needs_mobile_confirmation) {
        console.log('⚠ Mobile Bestätigung erforderlich!');
      }
    }

    return result;
  }

  // Trade Offer ablehnen
  async declineTradeOffer(offerID) {
    const formData = new URLSearchParams({
      sessionid: this.sessionid
    });

    const response = await fetch(`https://steamcommunity.com/tradeoffer/${offerID}/decline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': this.cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString()
    });

    const result = await response.json();
    console.log(`✓ Trade Offer abgelehnt! ID: ${offerID}`);
    return result;
  }

  // Hilfsfunktion: Account ID zu SteamID64
  accountIDToSteamID64(accountID) {
    return (BigInt(accountID) + BigInt('76561197960265728')).toString();
  }
}

// Verwendung:
async function main() {
  // 1. Cookies aus Browser extrahieren (manuell oder mit Puppeteer)
  const steamLoginSecure = 'YOUR_STEAM_LOGIN_SECURE_COOKIE';
  const sessionid = 'YOUR_SESSION_ID';

  const bot = new SteamTradingBot(steamLoginSecure, sessionid);

  // 2. Eigenes Inventory abrufen
  const mySteamID = '76561198012345678';
  const inventory = await bot.getMyInventory(mySteamID);

  console.log('Inventar Items:', inventory.length);

  // Trade-locked Items finden
  const tradeLocked = inventory.filter(item => item.tradability !== 'Tradable');
  console.log('Trade-locked Items:', tradeLocked.length);

  tradeLocked.forEach(item => {
    console.log(`- ${item.name}: ${item.tradability}`);
  });

  // 3. Trade Offer senden
  const partnerTradeURL = 'https://steamcommunity.com/tradeoffer/new/?partner=52079950&token=AbCdEfGh';
  const urlParams = new URLSearchParams(partnerTradeURL.split('?')[1]);
  const partnerAccountID = urlParams.get('partner');
  const token = urlParams.get('token');

  // Items auswählen zum Traden (nur tradable Items!)
  const tradableItems = inventory.filter(item => item.tradable === 1);
  const itemsToGive = [tradableItems[0]];  // Erstes tradable Item anbieten
  const itemsToReceive = [];  // Nichts verlangen (Geschenk)

  const result = await bot.sendTradeOffer(
    partnerAccountID,
    token,
    itemsToGive,
    itemsToReceive,
    'Hier ist ein Geschenk!'
  );

  console.log('Result:', result);

  // WICHTIG: Jetzt musst du auf dem Handy in der Steam App bestätigen!
}

// main();
```

### Beispiel: Trade Offer mit Access Token API abrufen

```javascript
const SteamCommunity = require('steamcommunity');

// Steam Web API Access Token verwenden (NICHT API Key!)
async function getTradeOffers(accessToken) {
  const response = await fetch(
    `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?` +
    `get_received_offers=1&get_sent_offers=1&active_only=1&` +
    `get_descriptions=1&language=english&access_token=${accessToken}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }
  );

  const data = await response.json();

  if (data.response.trade_offers_received) {
    console.log(`${data.response.trade_offers_received.length} erhaltene Angebote`);

    data.response.trade_offers_received.forEach(offer => {
      console.log(`Offer ID: ${offer.tradeofferid}`);
      console.log(`Von: ${offer.accountid_other}`);
      console.log(`Status: ${getOfferState(offer.trade_offer_state)}`);
      console.log(`Items zu erhalten: ${offer.items_to_receive?.length || 0}`);
      console.log(`Items zu geben: ${offer.items_to_give?.length || 0}`);
      console.log('---');
    });
  }

  return data.response;
}

function getOfferState(state) {
  const states = {
    1: 'Invalid',
    2: 'Active',
    3: 'Accepted',
    4: 'Countered',
    5: 'Expired',
    6: 'Canceled',
    7: 'Declined',
    8: 'InvalidItems',
    9: 'NeedsConfirmation',
    10: 'CanceledBySecondFactor',
    11: 'InEscrow'
  };
  return states[state] || 'Unknown';
}
```

---

## Wichtige Hinweise

### 1. Mobile Authentifizierung (2FA)

**WICHTIG:** Trade Offers müssen immer über die Steam Mobile App bestätigt werden!

Nach dem Senden oder Akzeptieren eines Trade Offers erhältst du:
```json
{
  "needs_mobile_confirmation": true
}
```

**Du hast 2 Optionen:**

#### Option A: Manuelle Bestätigung
1. Steam Mobile App öffnen
2. Menü → Bestätigungen
3. Trade bestätigen

#### Option B: Automatische Bestätigung (mit Shared Secret)

```javascript
const SteamTotp = require('steam-totp');

// Shared Secret aus Steam Guard extrahieren (einmalig)
const sharedSecret = 'YOUR_SHARED_SECRET_FROM_STEAM_GUARD';

// Confirmation Key generieren
function generateConfirmationKey(identitySecret, time, tag) {
  const SteamTotp = require('steam-totp');
  return SteamTotp.getConfirmationKey(identitySecret, time, tag);
}

// Trade Confirmations automatisch bestätigen
// Erfordert node-steam-community oder steam-tradeoffer-manager Library
```

**Shared Secret finden:**
- Android: Root + App Daten extrahieren
- iOS: Jailbreak erforderlich
- Sicherer: WinAuth oder SDA (Steam Desktop Authenticator) verwenden

### 2. Rate Limits

Steam hat strenge Rate Limits für Trade Offers:

- **Max 30 Trade Offers pro Tag** an verschiedene Personen
- **Max 5 Trade Offers gleichzeitig aktiv** zur gleichen Person
- Bei Überschreitung: Temporärer Ban (1-7 Tage)

**Best Practices:**
```javascript
// Delay zwischen Requests einbauen
async function sendMultipleOffers(offers) {
  for (const offer of offers) {
    await sendTradeOffer(offer);
    await sleep(5000);  // 5 Sekunden Pause
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 3. Cookie Gültigkeit

- `steamLoginSecure` Cookie ist meist **7-14 Tage gültig**
- Mit "Remember Me": bis zu **1 Jahr**
- Bei Logout oder Passwort-Änderung: sofort ungültig

**Cookie Refresh:**
```javascript
// Prüfen ob Cookie noch gültig ist
async function isCookieValid(steamLoginSecure, sessionid) {
  const response = await fetch('https://steamcommunity.com/my/profile', {
    headers: {
      'Cookie': `steamLoginSecure=${steamLoginSecure}; sessionid=${sessionid}`
    },
    redirect: 'manual'
  });

  // Wenn Redirect zu /login -> Cookie ungültig
  return response.status !== 302;
}
```

### 4. Trade-Lock Regeln

Items sind trade-locked nach:

- **Kauf vom Community Market:** 7 Tage
- **Erhalt via Trade:** 7 Tage (wenn neues Gerät verwendet wurde)
- **Geschenk/Aktivierung:** Permanent nicht tradable
- **Steam Guard Aktivierung:** 15 Tage für alle Items

**Prüfen ob Item tradable:**
```javascript
function canTradeItem(item) {
  // Muss tradable sein
  if (item.tradable === 0) {
    return false;
  }

  // Prüfen ob owner_descriptions vorhanden
  if (item.owner_descriptions) {
    const hasTradeableAfter = item.owner_descriptions.some(
      d => d.value.includes('Tradable') || d.value.includes('transferred')
    );

    if (hasTradeableAfter) {
      // Datum extrahieren und prüfen
      const dateMatch = item.owner_descriptions[0].value.match(/(\w+ \d+, \d{4})/);
      if (dateMatch) {
        const tradeableDate = new Date(dateMatch[1]);
        return new Date() >= tradeableDate;
      }
      return false;
    }
  }

  return true;
}
```

### 5. Fehlerbehandlung

Häufige Fehler und Lösungen:

#### Fehler 401 (Unauthorized)
```json
{ "error": "Unauthorized" }
```
**Lösung:** Cookie ungültig → Neu einloggen

#### Fehler 403 (Forbidden)
```json
{ "error": "Access Denied" }
```
**Lösung:**
- Trade URL Token falsch
- Privates Profil
- Trade-gebannt

#### Fehler 500 (Internal Server Error)
**Lösung:** Request wiederholen (mit Exponential Backoff)

```javascript
async function sendOfferWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendTradeOffer(params);
    } catch (error) {
      if (error.status === 500 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
        console.log(`Retry in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}
```

#### Item nicht mehr verfügbar
```json
{ "strError": "The item is no longer available for trading." }
```
**Gründe:**
- Item wurde bereits getradet
- Item ist trade-locked
- Item wurde gelöscht

### 6. Empfohlene Libraries

Statt alles manuell zu implementieren, verwende bewährte Libraries:

#### Node.js:
```bash
npm install steam-user steamcommunity steam-tradeoffer-manager steam-totp
```

**Vollständiges Beispiel mit Libraries:**
```javascript
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamTotp = require('steam-totp');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
  steam: client,
  community: community,
  language: 'en'
});

// Login mit Steam Guard
client.logOn({
  accountName: 'username',
  password: 'password',
  twoFactorCode: SteamTotp.generateAuthCode('SHARED_SECRET')
});

client.on('loggedOn', () => {
  console.log('✓ Eingeloggt!');
  client.setPersona(SteamUser.EPersonaState.Online);
});

client.on('webSession', (sessionID, cookies) => {
  manager.setCookies(cookies);
  community.setCookies(cookies);

  // Jetzt kannst du Trades machen!
  console.log('✓ Web Session bereit!');
});

// Inventory abrufen (inkl. trade-locked items!)
manager.getUserInventoryContents('76561198012345678', 730, 2, true, (err, inventory) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Inventar: ${inventory.length} Items`);
    inventory.forEach(item => {
      console.log(`- ${item.market_hash_name} (${item.assetid})`);
    });
  }
});

// Trade Offer senden
const offer = manager.createOffer('TRADE_URL');
offer.addMyItem({ appid: 730, contextid: 2, assetid: '123456789' });
offer.addTheirItem({ appid: 730, contextid: 2, assetid: '987654321' });
offer.setMessage('Guter Trade!');

offer.send((err, status) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`✓ Offer gesendet! Status: ${status}`);

    // Automatisch bestätigen (erfordert identitySecret)
    community.acceptConfirmationForObject('IDENTITY_SECRET', offer.id, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('✓ Trade bestätigt!');
      }
    });
  }
});

// Neue Trade Offers empfangen
manager.on('newOffer', (offer) => {
  console.log(`Neues Offer #${offer.id} von ${offer.partner}`);

  // Automatisch annehmen (VORSICHT!)
  offer.accept((err) => {
    if (err) {
      console.log(`Fehler beim Annehmen: ${err}`);
    } else {
      console.log('Trade angenommen!');
    }
  });
});
```

### 7. Sicherheitshinweise

**NIEMALS:**
- ❌ Shared Secret öffentlich teilen
- ❌ Cookies in Git committen
- ❌ Cookies über unsichere Verbindungen senden
- ❌ Steam Login Credentials im Code speichern

**IMMER:**
- ✅ Umgebungsvariablen für Secrets verwenden
- ✅ HTTPS für alle Requests
- ✅ Cookies sicher speichern (verschlüsselt)
- ✅ Rate Limits respektieren
- ✅ Fehlerbehandlung implementieren

```javascript
// .env Datei verwenden
require('dotenv').config();

const bot = new SteamTradingBot(
  process.env.STEAM_LOGIN_SECURE,
  process.env.SESSION_ID
);
```

---

## Zusammenfassung

### Inventory Items sehen (inkl. trade-locked):
```javascript
// Mit Browser Cookies:
GET https://steamcommunity.com/inventory/{STEAM_ID}/730/2/?count=2000
Headers: Cookie: steamLoginSecure=...; sessionid=...
```

### Trade Offer senden:
```javascript
POST https://steamcommunity.com/tradeoffer/new/send
Body: sessionid, partner, json_tradeoffer, trade_offer_create_params
→ Danach: Mobile App Bestätigung erforderlich!
```

### Trade Offer akzeptieren:
```javascript
POST https://steamcommunity.com/tradeoffer/{OFFER_ID}/accept
Body: sessionid, tradeofferid, partner
→ Danach: Mobile App Bestätigung erforderlich!
```

### Trade Offer ablehnen:
```javascript
POST https://steamcommunity.com/tradeoffer/{OFFER_ID}/decline
Body: sessionid
```

**Wichtigste Erkenntnisse:**
1. Inventory API funktioniert NUR mit Browser-Session Cookies
2. Kein API Key kann Inventory Zugriff gewähren
3. Trade-locked Items sind in der API sichtbar (Steam filtert nur UI)
4. Alle Trade Aktionen benötigen Mobile 2FA Bestätigung
5. Verwende node-steam Libraries für Produktions-Code

---

## Support & Weitere Ressourcen

- [Steam Web API Dokumentation](https://developer.valvesoftware.com/wiki/Steam_Web_API)
- [node-steam-user](https://github.com/DoctorMcKay/node-steam-user)
- [steam-tradeoffer-manager](https://github.com/DoctorMcKay/node-steam-tradeoffer-manager)
- [Steam Community Forums](https://steamcommunity.com/discussions/forum/10/)
