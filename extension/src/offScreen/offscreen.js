import DOMPurify from 'dompurify';

// Play sound with access to DOM APIs
const playAudio = (source, volume) => {
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play();
};

const scrapeAPIKey = () => new Promise((resolve, reject) => {
  const getRequest = new Request('https://steamcommunity.com/dev/apikey');

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response.statusText);
    } else return response.text();
  }).then((body) => {
    let apiKey = null;

    try {
      const html = document.createElement('html');
      html.innerHTML = DOMPurify.sanitize(body);
      apiKey = html.querySelector('#bodyContents_ex').querySelector('p').innerText.split(': ')[1];
      resolve(apiKey);
    } catch (e) {
      console.log(e);
      console.log(body);
      reject(e);
    }
  }).catch((err) => {
    console.log(err);
  });
});

const scrapeFriendRequests = () => new Promise((resolve, reject) => {
  const getRequest = new Request('https://steamcommunity.com/my/friends/pending');

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response);
      return null;
    }
    return response.text();
  }).then((body) => {
    if (body !== null) {
      const html = document.createElement('html');
      html.innerHTML = DOMPurify.sanitize(body);

      let loggedOut = false;
      html.querySelectorAll('a.global_action_link').forEach((link) => {
        if (link.getAttribute('href').includes('https://steamcommunity.com/login/home/')) {
          loggedOut = true;
        }
      });

      const receivedInvitesElement = html.querySelector('#search_results');
      const inviters = [];

      if (receivedInvitesElement !== null) {
        receivedInvitesElement.querySelectorAll('.invite_row').forEach((inviteRow) => {
          inviters.push({
            steamID: inviteRow.getAttribute('data-steamid'),
            accountID: inviteRow.getAttribute('data-accountid'),
            name: inviteRow.querySelector('.invite_block_name').firstElementChild.innerText,
            level: inviteRow.querySelector('.friendPlayerLevelNum').innerText,
            evalTries: 0,
            avatar: inviteRow.querySelector('.playerAvatar > a > img').getAttribute('src'),
          });
        });
        resolve(inviters);
      } else {
        console.log('no received invites element');
        if (loggedOut) reject('loggedOut');
        else reject(inviters);
      }
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

const scrapeCommonFriends = (accountID) => new Promise((resolve, reject) => {
  const request = new Request(`https://steamcommunity.com/actions/PlayerList/?type=friendsincommon&target=${accountID}`,
    {
      method: 'GET',
    });

  fetch(request).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response);
      return null;
    }
    return response.text();
  }).then((body) => {
    if (body !== null) {
      const html = document.createElement('html');
      html.innerHTML = DOMPurify.sanitize(body);
      const friends = [];

      html.querySelectorAll('.friendBlock.persona').forEach((friendBlock) => {
        const nickNameBlock = friendBlock.querySelector('.nickname_block');

        friends.push({
          profileLink: friendBlock.querySelector('.friendBlockLinkOverlay').getAttribute('href'),
          accountID: friendBlock.getAttribute('data-miniprofile'),
          name: friendBlock.querySelector('.friendBlockContent').firstChild.nodeValue.trim(),
          avatar: friendBlock.querySelector('.playerAvatar').firstElementChild.getAttribute('src'),
          nickname: nickNameBlock !== null ? nickNameBlock.innerText : '',
        });
      });
      resolve(friends);
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if ('playAudio' in message) {
    playAudio(message.playAudio.sourceURL, message.playAudio.volume);
  } else if ('scrapeAPIKey' in message) {
    scrapeAPIKey().then((apiKey) => {
      sendResponse(apiKey);
    }).catch((err) => {
      console.log(err);
      sendResponse(null);
    });
    return true; // async return to signal that it will return later
  } else if ('scrapeFriendRequests' in message) {
    scrapeFriendRequests().then((invites) => {
      sendResponse({
        success: true,
        invites,
      });
    }).catch((err) => {
      sendResponse({
        success: false,
        error: err,
      });
    });
    return true; // async return to signal that it will return later
  } else if ('scrapeCommonFriends' in message) {
    scrapeCommonFriends(message.scrapeCommonFriends).then((commonFriends) => {
      sendResponse({
        success: true,
        commonFriends,
      });
    }).catch((err) => {
      sendResponse({
        success: false,
        error: err,
      });
    });
    return true; // async return to signal that it will return later
  }
});
