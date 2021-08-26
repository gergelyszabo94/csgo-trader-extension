import { FloatInfo, FloatsInfo } from 'types';
import { getFloatInfoFromCache } from 'utils/floatCaching';
import * as runtime from 'utils/helpers/runtime';
import * as localStorage from 'utils/helpers/localStorage';
import { sleep } from 'utils/simpleUtils';

const floatQueue = {
    active: false,
    jobs: [],
    cleanupFunction: () => {}, // optional function that is executed when all jobs are done
};

export const workOnFloatQueue = async () => {
    if (floatQueue.jobs.length === 0) {
        floatQueue.cleanupFunction();
        floatQueue.active = false;
        return;
    }

    floatQueue.active = true;
    const job = floatQueue.jobs.shift();

    const floatsInfo: FloatsInfo = await getFloatInfoFromCache(job.assetID);
    const floatInfo: FloatInfo = floatsInfo[job.assetID];

    if (floatInfo !== null) {
        job.callBackFunction(job, floatInfo, floatQueue);
        await workOnFloatQueue();
        return;
    }

    const response = await runtime.sendMessage({
        fetchFloatInfo: {
            inspectLink: job.inspectLink,
            price: job.price,
        },
    });

    if (response !== 'error' && response !== 500) {
        job.callBackFunction(job, response.floatInfo, floatQueue);
    }

    const floatQueueActivity = (await localStorage.get('floatQueueActivity')).floatQueueActivity;
    const secondsFromLastUse = (Date.now() - new Date(floatQueueActivity.lastUsed).getTime()) / 1000;

    // tries to avoid having multiple float queues running concurrently on different pages
    if (secondsFromLastUse < 5 && floatQueueActivity.usedAt !== window.location.href) {
        await sleep(5000);
    } else if (response === 500) {
        // csgofloat usually returns 500 when it is not able to access steam
        // or when cloudflare throttles the requests
        // let's have a longer delay in this case
        await sleep(30000);
    }
    await workOnFloatQueue();
    await localStorage.set({
        floatQueueActivity: {
            lastUsed: Date.now(),
            usedAt: window.location.href,
        },
    });
};

export default floatQueue;
