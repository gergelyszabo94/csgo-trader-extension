const trackEvent =  (event) => {
    const analyticsInfo = {
        type: event.type,
        action: event.action,
        timestamp: Date.now()
    };

    chrome.storage.local.get('analyticsEvents', (result) => {
        chrome.storage.local.set({
            analyticsEvents: [...result.analyticsEvents, analyticsInfo]
        }, () => {});
    });
};

export { trackEvent };