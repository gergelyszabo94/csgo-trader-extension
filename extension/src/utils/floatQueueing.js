import { getFloatInfoFromCache } from 'utils/floatCaching';

const floatQueue = {
  active: false,
  jobs: [],
};

const workOnFloatQueue = () => {
  if (floatQueue.jobs.length !== 0) {
    floatQueue.active = true;
    const job = floatQueue.jobs.shift();

    getFloatInfoFromCache(job.assetID).then(
      (floatInfo) => {
        if (floatInfo[job.assetID] !== null) {
          job.callBackFunction(job, floatInfo[job.assetID], floatQueue);
          workOnFloatQueue();
        } else {
          chrome.runtime.sendMessage({ fetchFloatInfo: job.inspectLink }, (response) => {
            if (response !== 'error') {
              job.callBackFunction(job, response.floatInfo, floatQueue);
            }
            chrome.storage.local.get(['floatQueueActivity'], ({ floatQueueActivity }) => {
              const secondsFromLastUse = ((Date.now()
                - new Date(floatQueueActivity.lastUsed)) / 1000);
              // tries to avoid having multiple float queues running concurrently on different pages
              if (secondsFromLastUse < 5 && floatQueueActivity.usedAt !== window.location.href) {
                setTimeout(() => {
                  workOnFloatQueue();
                }, 5000);
              } else workOnFloatQueue();
              chrome.storage.local.set({
                floatQueueActivity: {
                  lastUsed: Date.now(),
                  usedAt: window.location.href,
                },
              });
            });
          });
        }
      },
    );
  } else floatQueue.active = false;
};

export { workOnFloatQueue };

export default floatQueue;
