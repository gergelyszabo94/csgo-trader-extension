export const sendMessage = async (message: any): Promise<any> => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, resolve);
    });
};

export const platformInfo = async (): Promise<chrome.runtime.PlatformInfo> => {
    return new Promise((resolve) => {
        chrome.runtime.getPlatformInfo(resolve);
    });
};
