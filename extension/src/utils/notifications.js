import { notificationSounds } from 'utils/static/notifications';
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

const playNotificationSound = () => {
  chrome.storage.local.get(
    ['notificationSoundOn', 'notificationSoundToPlay', 'notificationVolume', 'customNotificationURL'],
    ({
      notificationSoundOn, notificationSoundToPlay, notificationVolume, customNotificationURL,
    }) => {
      if (notificationSoundOn) {
        const volume = notificationVolume / 100;
        if (notificationSoundToPlay === notificationSounds.custom.key) {
          playAudio(customNotificationURL, 'remote', volume);
        } else {
          playAudio(`sounds/notification/${notificationSoundToPlay}.mp3`, 'local', volume);
        }
      }
    },
  );
};

const notifyOnDiscord = (embed) => {
  chrome.storage.local.get(['allowDiscordNotification', 'discordNotificationHook'],
    ({ allowDiscordNotification, discordNotificationHook }) => {
      if (allowDiscordNotification && discordNotificationHook !== '') {
        const request = new Request(discordNotificationHook, {
          method: 'POST',
          body: JSON.stringify({
            embeds: [embed],
            username: 'CSGOTRADER.APP',
            avatar_url: 'https://csgotrader.app/cstlogo48.png',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        fetch(request).then((response) => {
          if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }).catch((err) => { console.log(err); });
      }
    });
};

const loggedOutNotification = (loggedOut) => {
  if (loggedOut) {
    chrome.storage.local.get(
      [
        'logOutDetected', 'lastLogoutNotified', 'notifyAboutBeingLoggedOut',
        'notifyAboutBeingLoggedOutOnDiscord', 'nickNameOfUser',
      ],
      ({
        logOutDetected, lastLogoutNotified, notifyAboutBeingLoggedOut,
        notifyAboutBeingLoggedOutOnDiscord, nickNameOfUser,
      }) => {
        chrome.storage.local.set({ logOutDetected: true }, () => { });

        if (!logOutDetected) {
          // first attempt to get a new session
        // if it fails, then we end up here in the next interval and notify the user
          console.log('Session expired? Attempting to refresh a Steam page or open the Steam trade offers page to get a new session.');

          chrome.permissions.contains({ permissions: ['tabs'] }, (permission) => {
            if (permission) {
              chrome.tabs.query({ url: 'https://steamcommunity.com/*' }, (tabs) => {
                if (tabs.length !== 0) chrome.tabs.reload(tabs[0].id, {}, () => {});
                else {
                  chrome.tabs.create({
                    url: 'https://steamcommunity.com/my/tradeoffers?csgotrader_close=true',
                  });
                }
              });
            }
          });
        }

        if (logOutDetected && (Date.now() - lastLogoutNotified) > 60 * 60 * 1000) {
          // should only send notification once per hour
          chrome.storage.local.set({ lastLogoutNotified: Date.now() }, () => { });
          const title = 'You are not signed in on Steam!';
          const message = `Hi, ${nickNameOfUser}! You set to be notified if the extension detects that you are not logged in.`;

          if (notifyAboutBeingLoggedOut) {
            chrome.notifications.create('loggedOutOfSteam', {
              type: 'basic',
              iconUrl: '/images/cstlogo128.png',
              title,
              message,
            }, () => {
              playNotificationSound();
            });
          }

          if (notifyAboutBeingLoggedOutOnDiscord) {
            const embed = {
              footer: {
                text: 'CSGO Trader',
                icon_url: 'https://csgotrader.app/cstlogo48.png',
              },
              title,
              description: message,
              // #ff8c00 (taken from csgotrader.app text color)
              color: 16747520,
              fields: [],
              timestamp: new Date(Date.now()).toISOString(),
              type: 'rich',
            };

            notifyOnDiscord(embed);
          }
        }
      },
    );
  } else chrome.storage.local.set({ logOutDetected: false }, () => { });
};

export {
  reverseWhenNotifDetails, determineNotificationDate, notifyOnDiscord,
  playNotificationSound, loggedOutNotification,
};
