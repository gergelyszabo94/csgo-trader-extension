interface Link {
    title: string;
    id: string;
    path: string;
    isExternal: boolean;
}


const links: Link[] = [
    {
        title: 'Options',
        id: 'options',
        path: '/options/general/',
        isExternal: false,
    },
    {
        title: 'Bookmarks',
        id: 'bookmarks',
        path: '/bookmarks/',
        isExternal: false,
    },
    {
        title: 'Trade History',
        id: 'tradehistory',
        path: '/trade-history/history',
        isExternal: false,
    },
    {
        title: 'Changelog',
        id: 'changelog',
        path: 'https://csgotrader.app/changelog/',
        isExternal: true,
    },
    {
        title: 'Release-Notes',
        id: 'release-notes',
        path: 'https://csgotrader.app/release-notes/',
        isExternal: true,
    },
    {
        title: 'Steam Group',
        id: 'group',
        path: 'https://csgotrader.app/group/',
        isExternal: true,
    },
    {
        title: 'Prices',
        id: 'prices',
        path: 'https://csgotrader.app/prices/',
        isExternal: true,
    },
    {
        title: 'FAQ',
        id: 'faq',
        path: 'https://csgotrader.app/faq/',
        isExternal: true,
    },
];

export default links;
