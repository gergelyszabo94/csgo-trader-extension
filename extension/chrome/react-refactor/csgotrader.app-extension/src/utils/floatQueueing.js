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
            workOnFloatQueue();
          });
        }
      },
    );
  } else floatQueue.active = false;
};

export { workOnFloatQueue };

export default floatQueue;
