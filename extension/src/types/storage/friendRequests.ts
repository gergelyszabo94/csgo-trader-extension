export interface Inviter {
    accountID: string;
    avatar: string;
    bans: Bans;
    commonFriends: CommonFriend[];
    csgoInventoryValue: number | string;
    evalTries: number;
    evaluation: Evaluation;
    level: string;
    name: string;
    pastRequests: number;
    steamID: string;
    steamRepInfo: SteamRepInfo;
    summary: Summary;
}

export interface Summary {
    avatar: string;
    avatarfull: string;
    avatarhash: string;
    avatarmedium: string;
    communityvisibilitystate: number;
    personaname: string;
    personastate: number;
    personastateflags: number;
    primaryclanid: string;
    profilestate: number;
    profileurl: string;
    realname: string;
    steamid: string;
    timecreated: number;
    loccountrycode?: string;
}

export interface SteamRepInfo {
    flags: Flags;
    reputation: Reputation;
    steamID32: string;
    steamID64: string;
    steamrepurl: string;
}

export interface Reputation {
    full: string;
    summary: string;
}

export interface Flags {
    status: string;
}

export interface Evaluation {
    action: string;
    appliedRule: number;
}

export interface CommonFriend {
    accountID: string;
    avatar: string;
    name: string;
    nickname: string;
    profileLink: string;
}

export interface Bans {
    CommunityBanned: boolean;
    DaysSinceLastBan: number;
    EconomyBan: string;
    NumberOfGameBans: number;
    NumberOfVACBans: number;
    SteamId: string;
    VACBanned: boolean;
}
