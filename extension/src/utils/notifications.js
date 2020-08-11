import { playAudio } from 'utils/simpleUtils';

const determineNotificationDate = (
  tradableDate,
  minutesOrHours,
  numberOfMinutesOrHours,
  beforeOrAfter,
) => {
  let baseTimeUnit = 0;
  if (minutesOrHours === 'minutes') baseTimeUnit = 60;
  else if (minutesOrHours === 'hours') baseTimeUnit = 3600;
  if (beforeOrAfter === 'before') baseTimeUnit *= -1;
  const timeDifference = numberOfMinutesOrHours * baseTimeUnit;

  return new Date(
    (parseInt((new Date(tradableDate).getTime() / 1000).toFixed(0)) + timeDifference) * 1000,
  );
};

const reverseWhenNotifDetails = (tradability, notifTime) => {
  const difference = (parseInt(new Date(notifTime).getTime() / 1000).toFixed(0))
    - (parseInt(new Date(tradability).getTime() / 1000).toFixed(0)
    );
  const differenceAbs = Math.abs(difference);

  return {
    numberOfMinutesOrHours: differenceAbs / 60 >= 60
      ? (differenceAbs / 60) / 60
      : differenceAbs / 60,
    minutesOrHours: differenceAbs / 60 >= 60 ? 'hours' : 'minutes',
    beforeOrAfter: difference >= 0 ? 'after' : 'before',
  };
};

const getSteamNotificationCount = () => new Promise((resolve, reject) => {
  const getRequest = new Request('https://steamcommunity.com/actions/GetNotificationCounts');

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response.status);
      return null;
    } return response.json();
  }).then((body) => {
    if (body !== null) {
      const { notifications } = body;

      // notification types from:
      // https://github.com/WebVRRocks/moonrise/blob/c555aac08dd7f59ebd2dbe7607255cb003703410/src/plugins/notifications/index.js
      resolve({
        tradeOffers: notifications[1],
        gameTurns: notifications[2],
        moderatorMessages: notifications[3],
        comments: notifications[4],
        items: notifications[5],
        invites: notifications[6],
        // 7 is not known
        gifts: notifications[8],
        messages: notifications[9],
        helpRequestReplies: notifications[10],
        accountAlerts: notifications[11],
      });
    }
  }).catch((err) => {
    console.log(err);
    reject(err);
  });
});

const playNotificationSound = () => {
  chrome.storage.local.get(
    ['notificationSoundOn', 'notificationSoundToPlay', 'notificationVolume'],
    ({ notificationSoundOn, notificationSoundToPlay, notificationVolume }) => {
      if (notificationSoundOn) {
        playAudio(`sounds/notification/${notificationSoundToPlay}.mp3`, notificationVolume / 100);
      }
    },
  );
};

export {
  reverseWhenNotifDetails, determineNotificationDate,
  getSteamNotificationCount, playNotificationSound,
};
