const currencies = {
    USD:{
        short: "USD",
        long: "United States dollar",
        sign: "$"
    },
    EUR:{
        short: "EUR",
        long: "Euro",
        sign: "€"
    },
    GBP:{
        short: "GBP",
        long: "Pound sterling",
        sign: "£"
    },
    KEY:{
        short: "KEY",
        long: "Case Key",
        sign: "K"
    },
    CNY:{
        short: "CNY",
        long: "Renminbi",
        sign: "¥"
    },
    JPY:{
        short: "JPY",
        long: "Japanese yen",
        sign: "¥"
    },
    CAD:{
        short: "CAD",
        long: "Canadian dollar",
        sign: "C$"
    },
    AUD:{
        short: "AUD",
        long: "Australian dollar",
        sign: "A$"
    },
    HKD:{
        short: "HKD",
        long: "Hong Kong dollar",
        sign: "HK$"
    },
    ISK:{
        short: "ISK",
        long: "Icelandic króna",
        sign: "kr"
    },
    PHP:{
        short: "PHP",
        long: "Philippine peso",
        sign: "₱"
    },
    DKK:{
        short: "DKK",
        long: "Danish krone",
        sign: "kr"
    },
    HUF:{
        short: "HUF",
        long: "Hungarian forint",
        sign: "Ft"
    },
    CZK:{
        short: "CZK",
        long: "Czech koruna",
        sign: "Kč"
    },
    RON:{
        short: "RON",
        long: "Romanian leu",
        sign: "L"
    },
    SEK:{
        short: "SEK",
        long: "Swedish krona",
        sign: "kr"
    },
    IDR:{
        short: "IDR",
        long: "Indonesian rupiah",
        sign: "Rp"
    },
    INR:{
        short: "INR",
        long: "Indian rupee",
        sign: "₹"
    },
    BRL:{
        short: "BRL",
        long: "Brazilian real",
        sign: "R$"
    },
    RUB:{
        short: "RUB",
        long: "Russian ruble",
        sign: "₽"
    },
    HRK:{
        short: "HRK",
        long: "Croatian kuna",
        sign: "kn"
    },
    THB:{
        short: "THB",
        long: "Thai baht",
        sign: "฿"
    },
    CHF:{
        short: "CHF",
        long: "Swiss franc",
        sign: "CHF"
    },
    MYR:{
        short: "MYR",
        long: "Malaysian ringgit",
        sign: "RM"
    },
    BGN:{
        short: "BGN",
        long: "Bulgarian lev",
        sign: "лв"
    },
    TRY:{
        short: "TRY",
        long: "Turkish lira",
        sign: "₺"
    },
    NOK:{
        short: "NOK",
        long: "Norwegian krone",
        sign: "kr"
    },
    NZD:{
        short: "NZD",
        long: "New Zealand dollar",
        sign: "NZ$"
    },
    ZAR:{
        short: "ZAR",
        long: "South African rand",
        sign: "R"
    },
    MXN:{
        short: "MXN",
        long: "Mexican peso",
        sign: "Mex$"
    },
    SGD:{
        short: "SGD",
        long: "Singapore dollar",
        sign: "S$"
    },
    ILS:{
        short: "ILS",
        long: "Israeli new shekel",
        sign: "₪"
    },
    KRW:{
        short: "KRW",
        long: "South Korean won",
        sign: "₩"
    },
    PLN:{
        short: "PLN",
        long: "Polish złoty",
        sign: "zł"
    },
    BTC:{
        short: "BTC",
        long: "Bitcoin",
        sign: "₿"
    },
    MBC:{
        short: "MBC",
        long: "μBTC (you-bit or 0.000001 of a Bitcoin)",
        sign: "μ₿"
    },
    ETH:{
        short: "ETH",
        long: "Ethereum",
        sign: "Ξ"
    },
    FET:{
        short: "FET",
        long: "Finney (0.001 of an Ether)",
        sign: "fΞ"
    },
    AED:{
        short: "AED",
        long: "United Arab Emirates Dirham",
        sign: "د.إ"
    },
    ARS:{
        short: "ARS",
        long: "Argentine Peso",
        sign: "AP$"
    },
    CLP:{
        short: "CLP",
        long: "Chilean Peso",
        sign: "CP$"
    },
    COP:{
        short: "COP",
        long: "Colombian Peso",
        sign: "COL$"
    },
    CRC:{
        short: "CRC",
        long: "Costa Rican Colón",
        sign: "₡"
    },
    KWD:{
        short: "KWD",
        long: "Kuwaiti Dinar",
        sign: "د.ك"
    },
    KZT:{
        short: "KZT",
        long: "Kazakhstani Tenge",
        sign: "₸"
    },
    PEN:{
        short: "PEN",
        long: "Peruvian Nuevo Sol",
        sign: "S/"
    },
    QAR:{
        short: "QAR",
        long: "Qatari Riyal",
        sign: "ر.ق"
    },
    SAR:{
        short: "SAR",
        long: "Saudi Riyal",
        sign: "﷼"
    },
    TWD:{
        short: "TWD",
        long: "New Taiwan Dollar",
        sign: "NT$"
    },
    UAH:{
        short: "UAH",
        long: "Ukrainian Hryvnia",
        sign: "₴"
    },
    UYU:{
        short: "UYU",
        long: "Uruguayan Peso",
        sign: "$U"
    },
    VND:{
        short: "VND",
        long: "Vietnamese Dong",
        sign: "₫"
    },
    GEL:{
        short: "GEL",
        long: "Georgian Lari",
        sign: "₾"
    }
};

const pricingProviders = {
    csgotrader: {
        name: "csgotrader",
        long: "CSGO Trader",
        short: "CS",
        url: "http://csgotrader.app",
        description: "The extension's own pricing, aims to be accurate and to provide some kind of price for every item.",
        pricing_modes: {
            "csgotrader": {
                description: "CSGO Trader price",
                name: "csgotrader",
                long: "CSGO Trader price"
            }
        }
    },
    bitskins: {
        name: "bitskins",
        long: "BITSKINS",
        short: "BS",
        url: "https://bitskins.com/",
        description: 'BITSKINS is a "real money" marketplace where you can buy and sell skins. They provide sales data through their API.',
        pricing_modes: {
            "bitskins": {
                description: "Standard BITSKINS price, I am not sure how they calculate it",
                name: "bitskins",
                long: "Standard BITSKINS price"
            },
            "instant_sale": {
                description: "Instant sale - what bitskins pays for your item when they buy it themselves",
                name: "instant_sale",
                long: "Instant sale price"
            }
        }
    },
    steam: {
        name: "steam",
        long: "Steam Market",
        short: "SM",
        url: "https://steamcommunity.com/market/",
        description: "Steam Community Market sales history.",
        pricing_modes: {
            "last_24h": {
                description: "Sales from the past 24 hours",
                name: "last_24h",
                long: "Last 24 Hours"
            },
            "last_7d": {
                description: "Sales from the past 7 days",
                name: "last_7d",
                long: "Last 7 days"
            },
            "last_30d": {
                description: "Sales from the past 30 days",
                name: "last_30d",
                long: "Last 30 days"
            }
        }
    },
    csmoney: {
        name: "csmoney",
        long: "CS.MONEY",
        short: "CM",
        url: "https://cs.money/",
        description: "CS.MONEY is a tradebot site that has it's own pricing. They also have different prices for each doppler phase.",
        pricing_modes: {
            "csmoney": {
                description: "CS.MONEY price",
                name: "csmoney",
                long: "CS.MONEY Price"
            }
        }
    },
    csgotm: {
        name: "csgotm",
        long: "CSGO.TM",
        short: "CT",
        url: "https://market.csgo.com/",
        description: "CSGO.TM or market.csgo.com is a Russian site for real money sales. They also provide pricing, but prices are missing for many items so I don't recommend using it.",
        pricing_modes: {
            "csgotm": {
                description: "CSGO.TM price",
                name: "csgotm",
                long: "CSGO.TM Price"
            }
        }
    },
    lootfarm: {
        name: "lootfarm",
        long: "LOOT.FARM",
        short: "LF",
        url: "https://loot.farm/",
        description: "LOOT.FARM is a tradebot site with public pricing, they tend to overvalue everything in general, so their prices differ from the others.",
        pricing_modes: {
            "lootfarm": {
                description: "LOOT.FARM price",
                name: "lootfarm",
                long: "LOOT.FARM Price"
            }
        }
    }
};

export { currencies, pricingProviders };