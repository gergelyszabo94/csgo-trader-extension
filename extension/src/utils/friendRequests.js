const getFriendRequests = () => new Promise((resolve, reject) => {
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
      html.innerHTML = body;
      const receivedInvitesElement = html.querySelector('#search_results');
      const inviters = [];

      if (receivedInvitesElement !== null) {
        receivedInvitesElement.querySelectorAll('.invite_row').forEach((inviteRow) => {
          inviters.push({
            steamID: inviteRow.getAttribute('data-steamid'),
            accountID: inviteRow.getAttribute('data-accountid'),
            name: inviteRow.querySelector('.invite_block_name').firstElementChild.innerText,
            level: inviteRow.querySelector('.friendPlayerLevelNum').innerText,
          });
        });
      }

      chrome.storage.local.set({
        friendRequests: {
          inviters,
          lastUpdated: Date.now(),
        },
      }, () => {
        resolve(inviters);
      });
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

// eslint-disable-next-line import/prefer-default-export
export { getFriendRequests };
