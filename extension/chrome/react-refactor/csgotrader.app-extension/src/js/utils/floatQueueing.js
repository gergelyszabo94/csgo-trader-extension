import { getFloatInfoFromCache } from 'js/utils/floatCaching';
import { addFloatDataToPage } from 'js/utils/utilsModular';
import { hideFloatBars as hideInventoryFloatBars } from 'js/content_scripts/steam/inventory';
import { hideFloatBar as hideMarketFloatBar } from 'js/content_scripts/steam/marketListing';


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
                    addFloatDataToPage(job, floatQueue, floatInfo[job.assetID]);
                    workOnFloatQueue();
                }
                else {
                    chrome.runtime.sendMessage({fetchFloatInfo: job.inspectLink}, (response) => {
                        if (response !== 'error') {
                            if (response !== 'nofloat') addFloatDataToPage(job, floatQueue, response.floatInfo);
                            else {
                                if (job.type === 'inventory_floatbar') hideInventoryFloatBars();
                                else if (job.type === 'market') hideMarketFloatBar(job.listingID);
                            }
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