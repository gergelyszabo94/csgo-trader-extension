import { getFloatInfoFromCache } from 'utils/floatCaching';

const floatQueue = {
  active: false,
  jobs: [],
  cleanupFunction: () => {}, // optional function that is executed when all jobs are done
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
          chrome.runtime.sendMessage({
            fetchFloatInfo: {
              inspectLink: job.inspectLink,
              price: job.price,
            },
          }, (response) => {
            if (response !== 'error' && response !== 500) {
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
              } else if (response === 500) {
                // csgofloat usually returns 500 when it is not able to access steam
                // or when cloudflare throttles the requests
                // let's have a longer delay in this case
                setTimeout(() => {
                  workOnFloatQueue();
                }, 30000);
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
  } else {
    floatQueue.cleanupFunction();
    floatQueue.active = false;
  }
};

export { workOnFloatQueue };

export default floatQueue;
