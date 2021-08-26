// resolves the chrome.runtime api to use promises over callback functions
// some functions already support this with overloading, but often times that overloading
// becomes tedious whereas a utility function can abstract that hassle away from the developer.

export const get = async (keys?: string | string[] | null): Promise<{ [key: string]: any }> => {
    if (!keys) keys = null;
    // undefined | null
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve);
    });
};

export const remove = async (keys: string | string[]): Promise<void> => {
    return new Promise<void>((resolve) => {
        chrome.storage.local.remove(keys, resolve);
    });
};

// the next two don't actually do anything.
// it's here mainly for name consisentcy with the others,
// but they can be modified if it needs to be.

export const set = async (items: { [key: string]: any }): Promise<void> => {
    await chrome.storage.local.set(items);
};

export const clear = async (): Promise<void> => {
    await chrome.storage.local.clear();
};
