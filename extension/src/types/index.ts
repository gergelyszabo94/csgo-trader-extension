// some global types that are used more than once
// can be added to, removed, replaced, etc in the future

// from local storage
export * from './storage';

// from steam api
export * from './api';

export interface DopplerMapping {
    type: string;
    name: string;
    short: string;
    color: string;
}