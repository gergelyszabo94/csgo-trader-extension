import { getFloatInfoFromCache } from 'js/utils/floatCaching';

const floatQueue = {
    active: false,
    jobs: []
};

const workOnFloatQueue = () => {
    if (floatQueue.jobs.length !== 0) {
        floatQueue.active = true;
        const job = floatQueue.jobs.shift();

        getFloatInfoFromCache(job.assetID).then(
            floatInfo => {
                if (floatInfo[job.assetID] !== null) {
                    job.callBackFunction(job, floatQueue, floatInfo[job.assetID]);
                    workOnFloatQueue();
                }
                else {
                    chrome.runtime.sendMessage({fetchFloatInfo: job.inspectLink}, (response) => {
                        if (response !== 'error') {
                            job.callBackFunction(job, floatQueue, response.floatInfo);
                            // if (response !== 'nofloat') addFloatDataToPage(job, floatQueue, response.floatInfo);
                            // else {
                            //     if (job.type === 'inventory_floatbar') hideFloatBarFunction();
                            //     else if (job.type === 'market') hideFloatBarFunction(job.listingID);
                            // }
                        }
                        workOnFloatQueue();
                    });
                }
            }
        );
    }
    else floatQueue.active = false;
};

export { workOnFloatQueue };

export default floatQueue;