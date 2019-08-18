const ruby = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/redjewel" class="gemIcon">';
const sapphire = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/bluejewel" class="gemIcon">';
const emerald = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/greenjewel" class="gemIcon">';
const blackPearl = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/lltqjewel" class="gemIcon">';

const commentsToReport = [
    'free skins CS:GO(100$)',
    'for all of your csgo graffitties',
    'CS:GO Cases For Keys',
    'the amount depends on hours in csgo',
    'promocode',
    'gives its users FREE',
    'for all your graffities and cases',
    'Your SteamID is selected as winner',
    'CS:GO CASES = 1 CS:GO KEY',
    'You are winner on weekly giveaway',
    'Do you want free skins',
    'Free skins CS:GO',
    'replenish your inventory with good skins',
    'gives its users a Karambit Fade',
    'this guy in my profile gives his skins',
    'bot to trade your cases for keys',
    'join tradeit and take part at promo action there',
    'Do you want free items for',
    'Do you want some free skins?',
    'watch this video and enjoy',
    'tradeit giveaway about',
    'Do you want to earn money?',
    'I want to collect as much graffities as possible',
    'Hi you can take 50 coins with my promo',
    'tastyskins',
    'gives to his users',
    'I\'m a major csgo playe and I\'ll trade my',
    'join the GIVEAWAY on gabenskins.pro',
    'Trade Your Cases For Keys',
    ' join bloodyskins',
    '🔴🔴🔴🔴🔴🔴⚪⚪⚪🔴',
    'asians are crazy',
    'asian_guy',
    'Your Steam ID is randomly selected',
    'get skins which havent even released lol',
    'TradeSkinsNow.com',
    'You will never open cs money again',
    'Dear winner',
    'Trade Your CS:GO Cases For',
    'I’m collecting csgo base grade items',
    'Erotic Streamer',
    'giveaway',
    'SKINSRENT.STORE',
    'skins-market.org'
];

function getPattern(name, paint_seed){
    if(/ Marble Fade /i.test(name)){
        let pattern;
        if(/Karambit/i.test(name)){pattern = patterns.marble_fades.karambit[paint_seed]}
        else if(/Butterfly/i.test(name)){pattern = patterns.marble_fades.butterfly[paint_seed]}
        else if(/M9 Bayonet/i.test(name)){pattern = patterns.marble_fades.m9[paint_seed]}
        else if(/Bayonet/i.test(name)){pattern = patterns.marble_fades.bayonet[paint_seed]}
        else if(/Talon/i.test(name)){pattern = patterns.marble_fades.talon[paint_seed]}
        else if(/Stiletto/i.test(name)){pattern = patterns.marble_fades.stiletto[paint_seed]}
        else if(/Navaja/i.test(name)){pattern = patterns.marble_fades.navaja[paint_seed]}
        else if(/Ursus/i.test(name)){pattern = patterns.marble_fades.ursus[paint_seed]}
        else if(/Huntsman/i.test(name)){pattern = patterns.marble_fades.huntsman[paint_seed]}
        else if(/Flip/i.test(name)){pattern = patterns.marble_fades.flip[paint_seed]}
        else if(/Bowie/i.test(name)){pattern = patterns.marble_fades.bowie[paint_seed]}
        else if(/Daggers/i.test(name)){pattern = patterns.marble_fades.daggers[paint_seed]}
        else if(/Gut/i.test(name)){pattern = patterns.marble_fades.gut[paint_seed]}
        else if(/Falchion/i.test(name)){pattern = patterns.marble_fades.falchion[paint_seed]}
        else{return undefined}

        if(pattern!==undefined){
            return {
                type: "marble_fade",
                value: pattern
            };
        }
        else{
            return undefined;
        }
    }
    else if(/ Fade /i.test(name)){
        let percentage;
        if(/Karambit/i.test(name)){percentage = patterns.fades.karambit[paint_seed]}
        else if(/Butterfly/i.test(name)){percentage = patterns.fades.butterfly[paint_seed]}
        else if(/M9 Bayonet/i.test(name)){percentage = patterns.fades.m9[paint_seed]}
        else if(/Bayonet/i.test(name)){percentage = patterns.fades.bayonet[paint_seed]}
        else if(/Talon/i.test(name)){percentage = patterns.fades.talon[paint_seed]}
        else if(/Stiletto/i.test(name)){percentage = patterns.fades.stiletto[paint_seed]}
        else if(/Navaja/i.test(name)){percentage = patterns.fades.navaja[paint_seed]}
        else if(/Ursus/i.test(name)){percentage = patterns.fades.ursus[paint_seed]}
        else if(/Huntsman/i.test(name)){percentage = patterns.fades.huntsman[paint_seed]}
        else if(/Flip/i.test(name)){percentage = patterns.fades.flip[paint_seed]}
        else if(/Bowie/i.test(name)){percentage = patterns.fades.bowie[paint_seed]}
        else if(/Daggers/i.test(name)){percentage = patterns.fades.daggers[paint_seed]}
        else if(/Gut/i.test(name)){percentage = patterns.fades.gut[paint_seed]}
        else if(/Falchion/i.test(name)){percentage = patterns.fades.falchion[paint_seed]}
        else if(/Glock/i.test(name)){percentage = patterns.fades.glock[paint_seed]}
        else{return undefined}

        if(percentage!==undefined){
            return {
                type: "fade",
                value: percentage + "% Fade"
            };
        }
        else{
            return undefined;
        }
    }
    else if(/ Case Hardened/i.test(name)){
        let pattern;
        if(/AK-47/i.test(name)){pattern = patterns.case_hardeneds.ak[paint_seed]}
        else if(/Butterfly/i.test(name)){pattern = patterns.case_hardeneds.butterfly[paint_seed]}
        else if(/M9 Bayonet/i.test(name)){pattern = patterns.case_hardeneds.m9[paint_seed]}
        else if(/Bayonet/i.test(name)){pattern = patterns.case_hardeneds.bayonet[paint_seed]}
        else if(/Talon/i.test(name)){pattern = patterns.case_hardeneds.talon[paint_seed]}
        else if(/Stiletto/i.test(name)){pattern = patterns.case_hardeneds.stiletto[paint_seed]}
        else if(/Navaja/i.test(name)){pattern = patterns.case_hardeneds.navaja[paint_seed]}
        else if(/Ursus/i.test(name)){pattern = patterns.case_hardeneds.ursus[paint_seed]}
        else if(/Huntsman/i.test(name)){pattern = patterns.case_hardeneds.huntsman[paint_seed]}
        else if(/Flip/i.test(name)){pattern = patterns.case_hardeneds.flip[paint_seed]}
        else if(/Bowie/i.test(name)){pattern = patterns.case_hardeneds.bowie[paint_seed]}
        else if(/Daggers/i.test(name)){pattern = patterns.case_hardeneds.daggers[paint_seed]}
        else if(/Gut/i.test(name)){pattern = patterns.case_hardeneds.gut[paint_seed]}
        else if(/Falchion/i.test(name)){pattern = patterns.case_hardeneds.falchion[paint_seed]}
        else if(/Karambit/i.test(name)){pattern = patterns.case_hardeneds.karambit[paint_seed]}
        else if(/Five-SeveN/i.test(name)){pattern = patterns.case_hardeneds.five_seven[paint_seed]}
        else{return undefined}

        if(pattern!==undefined){
            return {
                type: "case_hardened",
                value: pattern
            };
        }
        else{
            return undefined;
            // return {
            //     type: "case_hardened",
            //     value: "Not special or not found"
            // };
        }
    }
    else{
        return undefined;
    }
}

function getQuality(type){
    if(/Base Grade/i.test(type)){return qualities.base_grade}
    else if(/Classified/i.test(type)){return qualities.classified}
    else if(/Consumer Grade/i.test(type)){return qualities.consumer_grade}
    else if(/Contraband/i.test(type)){return qualities.contraband}
    else if(/Covert/i.test(type)){return qualities.covert}
    else if(/Exotic/i.test(type)){return qualities.exotic}
    else if(/Extraordinary/i.test(type)){return qualities.extraordinary}
    else if(/High Grade/i.test(type)){return qualities.high_grade}
    else if(/Industrial Grade/i.test(type)){return qualities.industrial_grade}
    else if(/Mil-Spec Grade/i.test(type)){return qualities.milspec_grade}
    else if(/Remarkable/i.test(type)){return qualities.remarkable}
    else if(/Restricted/i.test(type)){return qualities.restricted}
    else if(/Stock/i.test(type)){return qualities.stock}
    else{return qualities.stock}
}

function getQualityFromTags(tags){
    for(let tag of tags) {
        if(tag.category==="Rarity"){
            switch(tag.internal_name){
                case rarities.common.internal_name: return qualities.common;
                case rarities.common_weapon.internal_name: return qualities.common;
                case rarities.uncommon.internal_name: return qualities.uncommon;
                case rarities.uncommon_weapon.internal_name: return qualities.uncommon;
                case rarities.rare.internal_name: return qualities.rare;
                case rarities.rare_weapon.internal_name: return qualities.rare;
                case rarities.mythical.internal_name: return qualities.mythical;
                case rarities.mythical_weapon.internal_name: return qualities.mythical;
                case rarities.legendary.internal_name: return qualities.legendary;
                case rarities.legendary_weapon.internal_name: return qualities.legendary;
                case rarities.ancient.internal_name: return qualities.ancient;
                case rarities.ancient_weapon.internal_name: return qualities.ancient;
                case rarities.contraband.internal_name: return qualities.contraband;
                case rarities.contraband_weapon.internal_name: return qualities.contraband;
                default: return undefined;
            }
        }
    }
    return undefined;
}

function getExteriorFromTags(tags) {
    for(let tag of tags) {
        if(tag.category==="Exterior"){
            switch(tag.internal_name){
                case exteriors.factory_new.internal_name: return exteriors.factory_new;
                case exteriors.minimal_wear.internal_name: return exteriors.minimal_wear;
                case exteriors.field_tested.internal_name: return exteriors.field_tested;
                case exteriors.well_worn.internal_name: return exteriors.well_worn;
                case exteriors.battle_scarred.internal_name: return exteriors.battle_scarred;
                default: return undefined;
            }
        }
    }
    return undefined;
}

function getDopplerInfo(icon){
    switch(icon){
        //guts
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09i5hJCHkuXLI7PQhW4A18l4jeHVu9703Azs-hA_MTuncNWWIVU-aF7Z_1a7k-bo0cW_v8_OyXVqvyAqsy3D30vgdDGy9vw":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09i5hJCHkuXLI7PQhW4D18l4jeHVu96tilbtqEFrZT_3IYXBcgA4Z1_V_1e5wunu1pC6upucm3Zqu3EgtH7D30vgYyt-jDc":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09i5hJCHkuXLI7PQhW4C18l4jeHVu9Wt2Qbjrko6N2ulIIKXJAZqNFnU-lbsk-3t0Za77siYwXUwviMm5HrD30vgjkYaISA":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09i5hJCHkuXLI7PQhW4F18l4jeHVu4j22Q3hrUo_Zj2hdYeSegM9NFyCqADtyLvq0cW8v5rLwHViv3IgtynD30vgrLbjMOA":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP08-3hJCDnuXxDLbQhGld7cxrj-3--YXygED6_BVlZDv3IYLGJAE2aQvX_wW5xLzrhsDqvp7Pynpkv3Ui7XnUzhHmhAYMMLIU9_4nhg":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP086jlpm0mvbmMbfUn3FU7Pp9g-7J4cKm2QHiqkY6ZGD1LIfEJlA6MFqG8lG7lLy70ce7vcufzCBis3EksSregVXp1kbC88_z":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP0966lYOAh_L1Ibfum2pD6sl0g_PE8bP5gVO8v11tZzqhLYGRIw86aQ2G81i3k-bog8XptcjIynFi7CB3sH6Jzh2_1BlFcKUx0ncN5NuB":
            return dopplerPhases.bp;

        //daggers
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOym5Cbm_LmDKvZl3hUufp9g-7J4cKg3AXgrxJkZzqgcdTEcg5sY1mEqQXsk-3q15G76pnKmnFmsikg5CqMgVXp1pw20OEp":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOym5Cbm_LmDKvZl3hUuvpzteXI8oThxgHl_RdqMD_2cYeTIQ84ZQuE-VTsye3m1JTutM_Pn3Rh63Qn43vdlxapwUYb4JkLank":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOym5Cbm_LmDKvZl3hUu_p9g-7J4cLzjgW2-ktvZT_6dYfAdQI8YluE-wDtxe2505Do6Z_Oz3Rg7CJx5nqLgVXp1nwmojSb":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOym5Cbm_LmDKvZl3hUvPp9g-7J4cKg0AyxqUM4NWn0JIWWIAY6NVnQrAftxr3mhJHqvZmbySRgs3Mq7XmOgVXp1nQeST2E":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOllZCbn_7mNoTcl3lT5MB4kOzFyo7KhF2zowdyY2n7JoeddAZrZl2B_Fe2x--90MfuuZjLn3Ayv3N2ti2JnRGy0hAeaPsv26KMy01uWQ":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eOkgYKSqPr1Ibndk2JL7cFOhuDG_Zi7jAW3-RduYW_zJ9CTIQJoaQ7UqVm4l-_m1p6-6JqdznA27yMitnrZmgv3308wVSkT7w":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfw-bbeQJD4eO0mIGInOfxMqndqWZQ-sd9j-Db8IjKimu4ohQ0J3egJYCRJwNtaAnZqFbswunp0ZS_7Z_MyXpi7iknsXeJyxa3ghhJbOw5m7XAHiOIIXZS":
            return dopplerPhases.bp;

        //falchions
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhFRB4MRij7j--YXygED6_kZvZDryJoDHegU4YA2DqQC9wO_mgJe-vM6bwHBlviJ05HjblxC2iQYMMLJU9KLVJA":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhFRB4MRij7v--YXygED6_0M4YGr2dY6VJ1NoaArR-gK4yOu6jJ-8u8yYmydk7nErt3iJmBWz0gYMMLKkrq5FpQ":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhFRB4MRij7r--YXygED6-0RtYTr7I4LDcwJvMlnXrwK4xe_sgsK66JWcnXJj7nUj5HffnRHmggYMMLJlW7phRA":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhFRB4MRij73--YXygED6rkQ6amD3J9eUJw5raA7T_1TvyLrtgcK-vJjOwSNivSUi4n3eykO-iAYMMLJ7lIc8Bg":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0J3f6cYSWJAY8MAvV-1G9lO66gZW16pvIySFquichtHuIlkGy0xxPb7M9m7XAHmOSF-ns":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20heL2KoTcl3lT5MB4kOzFyoD8j1yg5RZrYjr6JY-cJgA5Zw2CrlPqxeu8hZK77c7NznA2uiFw4SyOmRfkiRpSLrs48wN4FN8":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20lfv1MLDBk2pD5Pp8i_vD-Yn8klGwlB81NDG3OtDAcgM4Mw6GrwS3kOjn15Hv7ZnBmiFjvCcr5y2OmhC_h0wdPbZth_WACQLJOWkAmeM":
            return dopplerPhases.bp;

        //bowies
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbukmRB-Ml0mNbR_Y3mjQWLpxo7Oy3tJI6ddwM-aQ7S_VW-w-a8gcDuvZrKz3Rl63F05X7UyRGziRFJa-xvgeveFwsmoJhDFQ":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbukmRB-Ml0mNbR_Y3mjQaLpxo7Oy3tI9eRd1I7aA6G8ge_lOi-1pW6vsnLzyNjviRw4Hnfl0eyghFPa7FsgOveFwvj2l7OdQ":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbukmRB-Ml0mNbR_Y3mjQeLpxo7Oy3tJtOVe1dsY1nUqAO_kua5hZXtuMybmHtivHZz5ivdl0DkhB4aaONp0eveFwvzsJ5Rmg":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbukmRB-Ml0mNbR_Y3mjQCLpxo7Oy3tddTAelc7aV6D-gC6lebtgpO8vp2YznBnv3Ug5CyLmBHh00wea-Vv0eveFwtL59uOfw":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbuhWpB-M14mOz--I3nilixogk5NwavfdHNNhhrM12E8we8k-7pgsTtu53Pm3Jl7HQksC3eyh22g0tEaOFr1KTIG13IGeUXS7HreSzp":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbuhH5T8fp8i_vD-Yn8klGwlB81NDG3OtDDewY6aF6G_la_wejpgcTpvMmcwHBqu3Qi4XjdnRO21ExFOLZng6GACQLJb0FpVsg":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLMrbulGdQ685hj-jT-bP4iUa2pxY1KTynS9rMJV56fwzW_1bryevohMLv6siYmnNn6XQr7CndzEa2h0tKardshqGZTV2bUq1XXP7VSLu9WCk":
            return dopplerPhases.bp;

        //flips
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOym5Cbm_LmDKvZl3hUufp9g-7J4cKj3FK2qEpvYmH7ddSRdVVvMFDTqVfsk7q6h8C_tZnJzHRh7CFw53zagVXp1vI5Ejry":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOym5Cbm_LmDKvZl3hUuvp9g-7J4cKn21Lg-UtsZzunJNCcdgQ9Zg7T-QS6wLu5h5e4vZXAzno16CQr4HnegVXp1j8d9SMm":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOym5Cbm_LmDKvZl3hUu_p9g-7J4cL23g3sr0Y4ZTihdteccwJqaViE-Fi8lby9hpbq6c_KzHMyvSYqs3zegVXp1mfvJpRH":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOym5Cbm_LmDKvZl3hUvPp9g-7J4cKm2VKy-0JvMWihItfAewRtN16F_gK3xu7vgsLo7ZjLzCBkvSYqsyuJgVXp1k9_xjt3":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOllZCbn_7mNoTcl3lT5MB4kOzFyoD8j1yg5UBuazj3cYKQJwA5ZwnVrla_yLi5hcPp6szPwHZqvnVx5n_Vyhzjgh1SLrs4EHv5ZcQ":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOkgYKSqPr1Ibndk2JL7cFOhuDG_Zi7jgLtqkVpZjrwJNKSdVVrMl7U_gLvw72-0Ze5u56bnXJgsyBws3bblgv33087zklSXg":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eO0mIGInOfxMqndqWZQ-sd9j-Db8IjKhF2zowdyZz_yLIfGdAFvYguD-Fa9kOrp15G9vpifz3A26ycjt3qMzBDig05Lafsv26IspbmNiQ":
            return dopplerPhases.bp;

        //huntsmans
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20k_jkI7fUhFRB4MRij7j--YXygED6-0Q-Z2umLYGddVc5ZlnU-QXowr2-08O9tZ_JyyAys3Jz4ivUnxK3hwYMMLKe5XXxtg":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20k_jkI7fUhFRB4MRij7v--YXygED68xFta2z0cYOWIVJqMF7T-Fi2xbvojcLtv5zAwXNnsnYr4naPzhKygQYMMLKHPHTzSA":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20k_jkI7fUhFRB4MRij7r--YXygED6qUVkNW_3IYCXdAc4ZwvZ8wTql-3vgcTq7cnOnXM1siUj537UnBblgQYMMLKO8np86Q":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20k_jkI7fUhFRB4MRij73--YXygED6-xBrYzv7dtSVcgM6YgnZ_1S_k7q6jMS8vJrPnCY1uCBztyqLmUey1wYMMLLSJ9t1zA":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0J3enddfGcFI4Y1_T-ljvkObp0ZLqvZrAzXthsnYh5CqPzEO00hxKae1rm7XAHud_L0L0":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20heL2KoTcl3lT5MB4kOzFyoD8j1yg5UZqMTj7ctOUIAY5YVHY-QO_k7vthpC5tcjAznti6yMn7HmLy0Th1RpSLrs4PnCsPQE":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfx_LLZTRB7dCJlY20lfv1MLDBk2pD5Pp8i_vD-Yn8klGwlB81NDG3OoWQJgFtaF-D_lK-kr3t15Tuv8jAmnJn6Ccj4yzenBPh1U1FPOM606eACQLJCUKwlNc":
            return dopplerPhases.bp;

        //bayonets
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJG48ymmIWZqOf8MqjUx1Rd4cJ5nqeT8Ymi3wzt-UNrZ2mmItWRcgRvM16BqVK4l7jq0J-4vZ3IwHQ16HUq-z-DyALmsiWI":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJG48ymmIWZqOf8MqjUxFRd4cJ5nqeW946n0FfgrRFqYWulIdSVdAI5NAqC-Fa2kOvv0Z-9vJ7KmidquCQr-z-DyAl0eh_q":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJG48ymmIWZqOf8MqjUxVRd4cJ5nqeXpdzx0FHgqhFqZmn6IY_DI1U8aFuB_FLql-nt1pe7tMybzHFmvCUj-z-DyAETkzcY":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJG48ymmIWZqOf8MqjUwlRd4cJ5nqeR9Iqt2gyw_xZlN2z3LNXDcgc9Y1CBqVLrkLvsjcDu7picmHJguiZ2-z-DyMqcL4Vk":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJR7cymnImZksj5MqnTmm5Y8sB1teXI8oThxlHtrkNoMWyhItDDcFJoaFjW_Vm7yL2-18W6uc6ayHcwuCQntH-Om0SpwUYb_FLG0qs":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJQ-d6vq42KhfX4NrLLk29u5Mx2gv2P9o6njA3mrxVrNm2iItXAdAY7ZFuEq1e2wri-gsTousjBn3Nqs3Fw5GGdwUIbpPL9uQ":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJA4N21n5COluX4DLbQhGld7cxrj-3--YXygED6rxVtMWmgJ4fDJ1U_aA6EqFC5w7vujMO9uJrIzCdg6HMgs3mMlxe-0wYMMLLYtmuUHw":
            return dopplerPhases.bp;

        //m9s
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5D19V5i_rEpLP5gVO8v11tMmD6IobEdFRsMFmB8lPvlL-9hZbuvJ_JziBn7HYltnvfnES21xhKcKUx0sfosVEP":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5D19V5i_rEp7P5gVO8v11uaz_7d9SRcQM-ZlCG-lS3x-_s0Je56JrMmCFnu3Yitnjby0Cx0B4acKUx0j6jkldx":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5D19V5i_rEprP5gVO8v11lZj-gIYbDclRqMA7Zq1S7lOm-0Za6753KmHoxvnQh5y7ZyhWxiRwecKUx0iL1oy6z":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjwPKvBmm5D19V5i_rEobP5gVO8v11kZTr6cdDAIVA5ZA2GqVW3x7281sftvZ_AzXZmv3Mm5H2LlxWw1RhIcKUx0uHVWO7n":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjnMqvBnmJD7fp8i_vD-Yn8klGwlB81NDG3OtSUJgY7YVvS-VfolLq7hsO5tZ_OnXo3uyhz7SyPnhGx0xoeb-dugKOACQLJ28w8Lgw":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjmJrnIqWZQ-sd9j-Db8IjKhF2zowdyYzjyLIGSIAA8YguCqVK9lOa-1JW5vprBz3EyviB07SveyhfkhklNP_sv26JLM0iiyQ":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-Kmsj2P7rSnXtU6dd9teTA5475jV2urhcDPzCkfMKLIwRvYwrWqVS8wezpjcS_78_Mn3Bruykj7HbfzhPm00xLOLc-jPXNHELeWfLcbrqw2A":
            return dopplerPhases.bp;

        //butterlies
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeyQyoD8j1yg5RVtMmCmctOWJlI-YwyD_VG8w-nohsPt78zKz3Zhsygq4HnczEHk0k5SLrs4Un2yL0k":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeyTyo7KhF2zowdyYmqicYedI1NoYAvR-FK5yevmg5S6us_MnSFjuSYm4ivaykDigBtIa_sv26I7TRzdOw":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeySyoD8j1yg5Uo_MGD7cYaXdw5oN1HS_Fnrx-m91MTt6JjJnXtmsicr7SrZyxK2gUxSLrs40_zJGdY":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPP7I6vdk3lu-M1wmeyVyoD8j1yg5UM-YDz2I4OScwJsZl7Vr1O9x-u9g8K6uJnOzHM16ScktnmJmR23hhhSLrs4sbhU0c4":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqOT1I6vZn3lU18hwmOvN8IXvjVCLqSwwOj6rYJiRdg42NAuE-lW5kri5hpbuvM7AzHtmsnMh4imPzUa3gB4aaOw9hfCeVxzAUJ5TOTzr":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqOXhMaLum2pD6sl0g_PE8bP5gVO8v11kYjjzJ9KcIFI5YliDqAXoxbrsgpC9up_BmCM17nYh4SndzRLl1xwdcKUx0pRZROip":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPX4Mrjahm5Q-slOh-jT94DwgU6xryw-DDWqc97RbA9vN1GD8gO2ybq7hsK9tZ_By3ZqsiJw7X3elxzj1xpPb7c506GZSVmAR_selHmOwYo":
            return dopplerPhases.bp;

        //karambits
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij7j--YXygED6-kU_Y2HyLYaXeldoZFHYqFa5w-btg8W-7s7PzndkuyJz5CvYzkO0hgYMMLK4xIyRWw":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij7v--YXygED6-BZpNTqicoWXcQ43aV6Br1DqxL--jZO_7svAzXs3uCQg4XyLmhXhhQYMMLKBF8xkUA":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij7r--YXygED6-EtrNmihLYaXIQ83Nw6C-1C6k-zvgMO7up7NmHs2uykl43fYnUG3hQYMMLINmYZu2g":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhFRB4MRij73--YXygED680pqMjr0IdeUd1drYFnR_QK2x73qg5G-uczMyntmvHYjsSrezhbh0wYMMLJgYOl_1g":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0J3egI4ORcQNqYw3W8la5w-frgJK77ZXKwCQysyVwtnbayxKzhxlIarRum7XAHvqFh2jA":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20heL2KoTcl3lT5MB4kOzFyoD8j1yg5UNkaz_xIdfEd1A5aQ3U-lPskunphJHptZvPwSM26CUht3_UmUe3gEpSLrs4ZlidBgY":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20lfv1MLDBk2pD5Pp8i_vD-Yn8klGwlB81NDG3OtWTJAdsNVCG-Vjvwrvsh8Dv6szBznVivSMnt3eOlx22hhhNbu1o0PaACQLJyiL9rI8":
            return dopplerPhases.bp;

        //gamma guts
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09u3mY2KqPP7I6vdk3lu-M1wmeyQyoD8j1yg5RI9YzymItKRcQY2YFyC-Fe7x-3p05K8uMybwXdmvyN34n6LnBGygUxSLrs4hchk9Mk":
            return dopplerPhases.gp1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09u3mY2KqPP7I6vdk3lu-M1wmeyTyoD8j1yg5RZrazv1J9fGJgRvNF_W_Afolefs0Z6_uJSaznM36yInt3rbnRW-iB9SLrs4UCqX9kU":
            return dopplerPhases.gp2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09u3mY2KqPP7I6vdk3lu-M1wmeySyoD8j1yg5Rc5Ymz1I9DDJgdtZgnZq1e4xrjrhZe6uc7MmyFr7HUqsCrZlhG3hUxSLrs4Ij6o7R8":
            return dopplerPhases.gp3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09u3mY2KqPP7I6vdk3lu-M1wmeyVyoD8j1yg5UU9Ymr7JoOUIQI5N12G_la_x-rs1pe0v5-bzHFh7HMg5yrVzRfi0E5SLrs49eTjEI8":
            return dopplerPhases.gp4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP09m7kZKKm_PLPrrDlGdU4d90jtbN_Iv9nBqxqRU5MG32ddeQIwdsaVqE_wTtkO66g5Hv7p6fzHprvidx4XiLzBezn1gSOQvdpryG":
            return dopplerPhases.em;

        //gamma flips
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOxlY2GlsjwPKvBmm5D19V5i_rEpLP5gVO8v11rMT_6JtWUcwE2ZVmF_1S9wurv18W5752dyXBlvHNw4XrVzRy1gxxFcKUx0qdLIRFw":
            return dopplerPhases.gp1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOxlY2GlsjwPKvBmm5D19V5i_rEp7P5gVO8v11lN2v2Io_DIwI3YQyC_FHqyezvhMS8v5_OyiRguCMgtHzczBWy000YcKUx0nna_20E":
            return dopplerPhases.gp2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOxlY2GlsjwPKvBmm5D19V5i_rEprP5gVO8v11vZD_6cIeWdwI_Mw7Y-QK6lbztjJ7u7sjJznQ2uyUq4S7bnhzl1xxLcKUx0mona-Mb":
            return dopplerPhases.gp3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOxlY2GlsjwPKvBmm5D19V5i_rEobP5gVO8v106MWH0IYTDdgU2ZQuE_lS8xb3vhsW1uM-YzHY3vyF25HzfnhOw0xFNcKUx0ilo-Uy6":
            return dopplerPhases.gp4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYQJD4eOzmYWZlvvwDLbQhGld7cxrj-3--YXygED6-UBlZWGiIICVdQBoZFHR-Fftk7y8hsTotZjAmiFhuil2ti6ImkCwhQYMMLJIJJ_2Qw":
            return dopplerPhases.em;

        //gamma bayonet
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJF7dG7lb-PmOfkP77DqXtZ6dZ029bN_Iv9nBrk-RE-NTygJYOdcwdsMlnW_Vi6xufuhZHt6p2an3cwvCYn5yrZn0O2n1gSOaR__zxS":
            return dopplerPhases.gp1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJF7dG7lb-PmOfkP77DqXtZ6dZ02NbN_Iv9nBq3rRBsNzv1LdXBIwI5YgqFqVi3kL3shJW578nAynU3vHZ34imOmRCzn1gSOeA4WWgj":
            return dopplerPhases.gp2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJF7dG7lb-PmOfkP77DqXtZ6dZ02dbN_Iv9nBrmrkFqYD_xcI_GcQ5rYg6DrAO6xL_mgJ_uvZ2YnXtq6CJ34nqPmkS2n1gSOSUsT3Uj":
            return dopplerPhases.gp3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJF7dG7lb-PmOfkP77DqXtZ6dZ03tbN_Iv9nBq2_kJkZWr6cISWcw9sNAvZqFHrwOu70Mfq7ZvKmHBnuXUmsHrcn0Swn1gSOXxc-0BQ":
            return dopplerPhases.gp4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpotLu8JAllx8zJfAJH4dmklYyPqPr1Ibndk2JL7cFOhuDG_Zi72VDh8kduZW37JIeWJ1Q9Yl2G8gToxrrmhpfvtZ6YynI1siRw7HbVmwv330-du9HHOA":
            return dopplerPhases.em;

        //gamma m9s
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjzMrbcl1RV59VhhuzTypz9iUex-iwwOj6rYJiRew4-MgrSqAO-yLvujMe4tMzJzSM2uylz5SrbnBC0hRpKO-1u1qbLVxzAUNEUr2p2":
            return dopplerPhases.gp1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjzMrbcl1RV59VhhuzTypz9iUex-SwwOj6rYJiRcg8-Z13Trlm5w--60ZS96szJzidn6ygi5yvamUPk0kxJb7E6hqaZVxzAUK6TGQbC":
            return dopplerPhases.gp2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjzMrbcl1RV59VhhuzTypz9iUex-CwwOj6rYJiWdFQ7N1DS_Fa3lOvv15a578-ayCRr7nRw5SuMnUS00BwYOrNvgfSYVxzAUKnD8K-k":
            return dopplerPhases.gp3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjzMrbcl1RV59VhhuzTypz9iUex_ywwOj6rYJicIQ9qYArT8wO8yLzq1pK0tJ6dnyFhviUm5yyJykSzh0oePOI7h_yZVxzAUMOxo1og":
            return dopplerPhases.gp4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmsjxPr7Dl2dV18hwmOvN8IXvjVCLpxo7Oy3tIdLEdgdqNAmBqFa_kO3mh8K9uJqbyiMy7HIn5H3VzUPl1B0dO7M7hOveFwvYitsMFw":
            return dopplerPhases.em;

        //gamma karambits
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQWLpxo7Oy3tI4CcIVA8MArW_VfrkOy-gsK7v5_LmnBmsnYn4i2MzB3j0klMbuZsg-veFwtNHI-dng":
            return dopplerPhases.gp1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQaLpxo7Oy3tcYKVcQRsZF_Q-FTow-zs0Jft7czNmiNluyV35nrbyR2_1UlPaOFp1uveFwtI0RP3qg":
            return dopplerPhases.gp2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQeLpxo7Oy3td9LDIQZtYVCE_FS8x-fqjZ_vv5mbnHZq7nN25yrdzR221BlFbew7jeveFwu1r0V1Rw":
            return dopplerPhases.gp3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kPb5PrrukmRB-Ml0mNbR_Y3mjQCLpxo7Oy3tddKScVVvYVzQq1a2lb2615Hu6p7OmHNluCdzsSvazkSyghBEOLNuh-veFwtgyyI7Iw":
            return dopplerPhases.gp4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20kvrxIbrdklRc6ddzhuzI74nxt1i9rBsofT-ld9LDJgVsY1nX-QLtlejqg5bu7Zydm3Q1uSVzsXmOmUe3ghFKauBxxavJdWR7Gog":
            return dopplerPhases.em;

        //stilettos
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20k_jkI7fUhFRB4MRij7j--YXygED6_kptYWmnINDAe1U_MFqE-AK8kubsgZC6vZTBy3dm7iAjty6OmRG0gAYMMLJXF6TfvA":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20k_jkI7fUhFRB4MRij7v--YXygED6_hZvNmH6dYCTIQQ9Ml3XrwTvwLi615K46s_Pmns1uXJ34SnYmBKw0AYMMLKAKIcTNQ":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20k_jkI7fUhFRB4MRij7r--YXygED6r0ZqZGv2JtKXJgc-ZlCG_1C2wOa6gZe4vs-cmyFrvyUr5S2LzRO10AYMMLIC5GArWw":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20k_jkI7fUhFRB4MRij73--YXygED6-0RoMWr3I9XAIQY9Mg6G-1e7krzq0Za06JSdznY1s3F3sH6OyR2-0gYMMLJWWwFisg":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0JwavdcTCJxg9ZF_WqADsyOm715Lpu5SYySFiuCV07XnczhGyhUlMPeI-16CWSl6cGeUXS8Mn9SuW":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20heL2KoTcl3lT5MB4kOzFyoD8j1yg5RA5MjylcIKdIwA_ZVmF8ljqwuvn1pK9uJzBmyZmvSAi4yzanBHlhhBSLrs4mlbW1wk":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20lfv1MLDBk2pD5Pp8i_vD-Yn8klGwlB81NDG3Oo-QIQA7ZFnSqVG9wuju0cfpucvLnHNivyFw7HrbmEGxgBxOaOFu1qCACQLJ4GHavAc":
            return dopplerPhases.bp;

        //ursuses
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJkI-bh_vxIYTBnmpC7ZROhuDG_Zi7jQWy-UFqN2r7INDDdAVsMAmD8lLql7vvhJPq75jLzXYysnIn7XbVmQv3309_tWjVng":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJkI-bh_vxIYTBnmpC7ZdOhuDG_Zi7iwLn_UVpZGrzcYKdcg82Z13U_FS-l7znjZ60tMzKmHRju3VwsX-LmAv330-XRUGjkQ":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJkI-bh_vxIYTBnmpC7ZZOhuDG_Zi70FbnqhVkMG7yJISQelc7N1rW-VW2yObngcS_78iazyA2vXYqsXjazQv330_A0SwGew":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJkI-bh_vxIYTBnmpC7ZFOhuDG_Zi7jgWw_hJsYjygIYDEdFdraV2FrFfql-jo05bvv5ibzXFjsiYn7XbVmAv3309R3fUXZg":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJh4Gbh__9Ib7um2pD6sl0g_PE8bP5gVO8vywwMiukcZiUdVI_ZwmC-Fa-xb_ujZW7ucycyXZg6Ckn4HaIzUGz1BtPauNu1vOZVxzAUD4jS_xv":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJhpWJjsj5MqnTmm5Y8sB1teXI8oThxlDtrRdtammhJI6WdVNoZA3U8gC-ye3sjZe175rNyCBnuiEh5nyLmxCpwUYbZYr74y0":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJloyKlPzkNrrDmlRc6ddzhuzI74nxt1i9rBsofW-gLdORJw42ZV6D_lG4kuy71Me9tZ3MwSdgsyl3tCzdn0DhgB1EbeBxxavJfwNOLfc":
            return dopplerPhases.bp;

        //navajas
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1OrYYiR95t21n4uFnvHxDLrcqW9e-NV9j_v-5YT0m1HllB81NDG3OoeScgM5aFDSqVbvlLjth8K_6MzOy3dl6yRz7Czemx3ihhhEabQ716OACQLJ_piUbl4":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1OrYYiR95t21n4uFnvHxDLrcqW9e-NV9j_v-5YT0m1HmlB81NDG3OoaSI1M4M1iE81jrxr-51Je_v52dyHoxvicm7C6OmBy0hU5IaOQ9hfOACQLJ1793rRA":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1OrYYiR95t21n4uFnvHxDLrcqW9e-NV9j_v-5YT0m1HnlB81NDG3OoOUdAA2YFmCqVfsw7rmhsfp6p3JyHBk6XInt37UmxTjiBxPO-M61qSACQLJmN5shCI":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1OrYYiR95t21n4uFnvHxDLrcqW9e-NV9j_v-5YT0m1HglB81NDG3OtCTclNqZAvR-1bvle7s0ce1uZXOzXZksiF04Xbamkay0ElPa7RohKCACQLJjXZ8CxQ":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1OrYYiR95t21n4uFnvHxDLrcqXhQ-NV5g_vEyoH0mla4rhomNj2ceN_CKkIgYwrW_QTvlOi6gpTvtc-YzHJl6yQl7XqPmxHi101Lbuxo1PSYTVqdUbsJQvdde5AbFA":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1OrYYiR95t21n4uFnvHxDLrcqXlE6txOh-jT94DwgU6xrywwOj6rYJiSIFA6YVjY_FntlLjojMK6tJuczHZn7Cgr5CrcnBezghxMaLA9gabPVxzAUCJgZThD":
            return dopplerPhases.rb;

        //talons
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxPrMfipP7dezhr-KmsjwPKvBmm5D19V5i_rEpLPigVC7vCwwOj6rYJiWdw87NFyB-wfqxLq5h5PtuJudyHU36SR25i7blkfmiBsYOOc-gvLPVxzAUHaSd1K1":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxPrMfipP7dezhr-KmsjwPKvBmm5D19V5i_rEp7PigVC7vCwwOj6rYJjBcAZvNFvTrFC_l7-5jJbvtMnMyHtrs3J27SqLlhG010xJOLM5gvyZVxzAUE0LMc1E":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxPrMfipP7dezhr-KmsjwPKvBmm5D19V5i_rEprPigVC7vCwwOj6rYJiQJFJvNF6D_gfvwOnvgsTqup3Bm3Iy7CRztn2JmBfm0xAdZ-c816OfVxzAUCeK9YIM":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxPrMfipP7dezhr-KmsjwPKvBmm5D19V5i_rEobPigVC7vCwwOj6rYJiVcgM-ZVuF-lPvk-q-hpXovJzAnXBnsiYm5iyLykfkhxpPZ-FvjfKaVxzAUEVCyl-g":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxPrMfipP7dezhr-KmsjnMqvBnmJD7fp8i_vD-Yn8klGwlB81NDG3Oo6WIw9vMF-BqAfokuzv18LptcnLziEyvCEksC2PlkeziR0eO-I9gvCACQLJ2IFZdow":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxPrMfipP7dezhr-KmsjmJrnIqWZQ-sd9j-Db8IjKhF2zowdyNj37cYaQcQ8_NF7Zr1Dqwb270cPv6Z_Izydj7CkjtHrelkThhxwaP_sv26JqHcKn6w":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxPrMfipP7dezhr-Kmsj2P7rSnXtU6dd9teTA5475jV2urhcDPzCkfML6Lld8Ng3O_AO4lbu908K0uJyYyXtiuSN34XiPnkTh1BlFb7E80PyeSF2dB6AbHb7CWCSD7XOwiQ":
            return dopplerPhases.bp;

        default: return dopplerPhases.unk;
    }
}

function getShortDate(tradabibilityDate){
    if(tradabibilityDate==="Tradable"||tradabibilityDate===""){
        return "T";
    }
    let now = new Date().getTime();
    let distance = new Date(tradabibilityDate) - now;
    if(distance<=0){
        return "T";
    }
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    if(days===0){
        if(hours===0){
            if(minutes===0){
                if(seconds===0){
                    return "";
                }
                else{
                    return seconds + "s";
                }
            }
            else{
                return minutes + "m";
            }
        }
        else {
            return hours + "h";
        }
    }
    else{
        return days + "d";
    }
}

function souvenirExists(iteminfo) {
    const collectionsWithSouvenirs = [
        'The Blacksite Collection',
        'The 2018 Inferno Collection',
        'The 2018 Nuke Collection',
        'The Cache Collection',
        'The Cobblestone Collection',
        'The Dust 2 Collection',
        'The Inferno Collection',
        'The Italy Collection',
        'The Lake Collection',
        'The Mirage Collection',
        'The Nuke Collection',
        'The Overpass Collection',
        'The Safehouse Collection',
        'The Train Collection'
    ];
    let collectionsWithSouvenirstoCheck = new RegExp(collectionsWithSouvenirs.join("|"), "i");

    return collectionsWithSouvenirstoCheck.test(iteminfo);

}

function goToInternalPage(targetURL) {
    chrome.tabs.query({}, function(tabs) {
        for (let i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url===("chrome-extension://"+ chrome.runtime.id + targetURL)) {
                chrome.tabs.reload(tab.id, {}, function(){});
                chrome.tabs.update(tab.id, {active: true});
                return;
            }
        }
        chrome.tabs.create({url: targetURL});
    });
}

function determineNotificationDate(tradableDate, minutesOrHours, numberOfMinutesOrHours, beforeOrAfter){
    let baseTimeUnit = 0;
    if(minutesOrHours==="minutes"){
        baseTimeUnit = 60;
    }
    else if(minutesOrHours==="hours"){
        baseTimeUnit = 3600;
    }
    if(beforeOrAfter==="before"){
        baseTimeUnit=baseTimeUnit*-1
    }
    let timeDifference = numberOfMinutesOrHours*baseTimeUnit;
    return new Date((parseInt((new Date(tradableDate).getTime() / 1000).toFixed(0)) + timeDifference)*1000);
}

function reverseWhenNotifDetails(tradability, notifTime){
    let beforeOrAfter =  "";
    let difference = (parseInt(new Date(notifTime).getTime() / 1000).toFixed(0)) - (parseInt(new Date(tradability).getTime() / 1000).toFixed(0));
    let differenceAbs =  Math.abs(difference);
    if(difference>=0){
        beforeOrAfter = "after";
    }
    else{
        beforeOrAfter = "before";
    }
    let minutesOrHours = "";
    let numberOfMinutesOrHours = 0;
    if((differenceAbs)/60>=60){
        minutesOrHours = "hours";
        numberOfMinutesOrHours = (differenceAbs/60)/60;
    }
    else{
        minutesOrHours = "minutes";
        numberOfMinutesOrHours = differenceAbs/60;
    }
    return {
        numberOfMinutesOrHours: numberOfMinutesOrHours,
        minutesOrHours: minutesOrHours,
        beforeOrAfter: beforeOrAfter
    };
}

function getOfferStyleSteamID(steamID64){
    return Number(steamID64.split("7656")[1]) - Number(1197960265728);
}

//gets the steam id of the user that's profile this script is run on
function getProfileOwnerSteamID(){
    let scriptToInject = `
    <script id="getProfileOwnerSteamID">
    document.querySelector("body").setAttribute("steamidOfProfileOwner", g_rgProfileData.steamid);
</script>`;
    $("body").append(scriptToInject);
    let result = $("body").attr("steamidOfProfileOwner");
    $("#getProfileOwnerSteamID").remove();
    return result;
}


//gets steamid of the user logged into steam (on profile pages)
function getUserSteamID(){
    let scriptToInject = `
    <script id="getUserSteamID">
    document.querySelector("body").setAttribute("steamidOfLoggedinUser", g_steamID);
</script>`;
    $("body").append(scriptToInject);
    let result =  $("body").attr("steamidOfLoggedinUser");
    $("#getUserSteamID").remove();
    return result;
}

//gets the other party's steam id in a trade offer
function getTradePartnerSteamID(){
    let scriptToInject = `
    <script id="getTradePartnerSteamID">
    document.querySelector("body").setAttribute("TradePartnerSteamID", g_ulTradePartnerSteamID);
</script>`;
    $("body").append(scriptToInject);
    let result =  $("body").attr("TradePartnerSteamID");
    $("#getTradePartnerSteamID").remove();
    return result;
}

function getInventoryOwnerID(){
    let scriptToInject = `
    <script id="getInventoryOwnerID">
    document.querySelector("body").setAttribute("inventoryOwnerID", UserYou.GetSteamId());
</script>`;
    $("body").append(scriptToInject);
    let result = $("body").attr("inventoryOwnerID");
    $("#getInventoryOwnerID").remove();
    return result;
}

function warnOfScammer(steamID, page) {
    chrome.runtime.sendMessage({getSteamRepInfo: steamID}, function(response) {
        if(response.SteamRepInfo.reputation.summary==="SCAMMER"){
            let backgroundURL = chrome.runtime.getURL("images/scammerbackground.jpg");
            $("body").prepend(`<div style="background-color: red; color: white; padding: 5px; text-align: center;" class="scammerWarning"><span>Watch out, this user was banned on SteamRep for scamming! You can check the details of what they did on <a style="color: black; font-weight: bold" href='https://steamrep.com/profiles/${steamID}'>steamrep.com</a></span></div>`)
            if(page==="offer"){
                $("body").css({"background-image": "url('" + backgroundURL + "')"});
            }
            else if(page==="profile"){
                $(".no_header.profile_page").css({"background-image": "url('" + backgroundURL + "')"});
            }

        }
    });

}

function parseStickerInfo(descriptions, linkType){
    let stickers = [];
    let link = "";
    if(linkType==="search"){
        link = "https://steamcommunity.com/market/search?q=";
    }
    else if(linkType==="direct"){
        link = "https://steamcommunity.com/market/listings/730/Sticker%20%7C%20";
    }
    descriptions.forEach(function (description) {
        if(/sticker_info/.test(description.value)){
            let names = description.value.split("><br>")[1].split(": ")[1].split("</center>")[0].split(", ");
            names = handleStickerNamesWithCommas(names);
            let iconURLs = description.value.split("src=\"");
            iconURLs.shift();
            iconURLs.forEach(function (iconURL, index) {
                iconURLs[index] = iconURL.split("\"><")[0];
            });
            names.forEach(function (name, index) {
                stickers.push({
                    name: name,
                    iconURL: iconURLs[index],
                    marketURL: link + name
                });
            });
        }
    });

    return stickers;
}

function handleStickerNamesWithCommas(names){
    let nameWithCommaFound = false;
    names.forEach(function (name, index) {
        if(name==="Don't Worry"&&names[index+1]==="I'm Pro"){
            names[index]="Don't Worry, I'm Pro";
            names = removeFromArray(names, index+1);
            nameWithCommaFound = true;
        }
    });
    if(nameWithCommaFound){
        return handleStickerNamesWithCommas(names);
    }
    else{
        return names;
    }
}

function removeFromArray(array, arrayIndex){
    let newArray = [];
    array.forEach(function (element, index) {
        if(!(index===arrayIndex)){
            newArray.push(element);
        }
    });
    return newArray;
}

function addReplytoCommentsFunctionality() {
    $(".commentthread_comment_actions").each(function () {
        $commentactions = $(this);
        if($commentactions.find(".replybutton").length===0){
            $commentactions.append(`<a class="actionlink replybutton" href="javascript:void(0)" data-tooltip-text="Reply"><img style="height: 16px; width: 16px" src="${chrome.runtime.getURL("images/reply.png")}"></a>`)
        }
    });

    $(".replybutton").off("click").on("click",function(){
        let commenterName = $(this).parent().parent().find($(".commentthread_author_link")).find("bdi").html().split(" <span class=\"nickname_block\">")[0];
        let currentContent = $(".commentthread_textarea").val();
        if(currentContent===""){
            $(".commentthread_textarea").val(currentContent + "[b]@" + commenterName + "[/b]: ");
        }
        else{
            $(".commentthread_textarea").val(currentContent + "\n[b]@" + commenterName + "[/b]: ");
        }
        $(".commentthread_textarea").focus();
    });
}

function addCommentsMutationObserver(){
    let observer = new MutationObserver(function(mutations, observer) {
        addReplytoCommentsFunctionality();
    });

    if($(".commentthread_comments").length!==0){
        observer.observe($(".commentthread_comments")[0], {
            subtree: true,
            attributes: false,
            childList: true
        });
    }
}

function reportComments(){
    chrome.storage.local.get(['flagScamComments'], function(result) {
        if(result.flagScamComments) {
            let spamTExtCheck = new RegExp(commentsToReport.join("|"), "i");

            $(".commentthread_comment.responsive_body_text").each(function () {
                $commentthread = $(this);
                if (spamTExtCheck.test($commentthread.find(".commentthread_comment_text").text()) && !$commentthread.hasClass("hidden_post")) {
                    $commentthread.find("a.report_and_hide").find("img").click();
                }
            });
        }
    });
}

function addDopplerPhase(item, dopplerInfo){
    if(dopplerInfo!==undefined){
        item.append(dopplerPhase);
        $dopplerPhase = item.find(".dopplerPhase");
        switch (dopplerInfo.short){
            case "SH": $dopplerPhase.append(sapphire); break;
            case "RB": $dopplerPhase.append(ruby); break;
            case "EM": $dopplerPhase.append(emerald); break;
            case "BP": $dopplerPhase.append(blackPearl); break;
            default: $dopplerPhase.text(dopplerInfo.short);
        }
    }
}

function updatePrices(){
    let request = new Request('https://prices.csgotrader.app/latest/prices.json');

    fetch(request).then(function(response) {
        return response.json();
    }).then(function(fullPricesJSON) {
        chrome.storage.local.get(['itemPricing', 'pricingProvider', 'pricingMode'], function(result) {
            if(result.itemPricing){
                let prices = {};
                const keys = Object.keys(fullPricesJSON);
                if(result.pricingProvider === pricingProviders.csgobackpack.name){
                        if(result.pricingMode === pricingProviders.csgobackpack.pricing_modes["7_days_average"].name){
                            for (const key of keys) {
                                if (fullPricesJSON[key][result.pricingProvider]["7_days"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                    prices[key] = fullPricesJSON[key][result.pricingProvider]["7_days"]["average"]
                                }
                                else {
                                    prices[key] = "null";
                                    console.log(key);
                                }
                            }
                        }
                        else if(result.pricingMode === pricingProviders.csgobackpack.pricing_modes["7_days_median"].name){
                            for (const key of keys) {
                                if (fullPricesJSON[key][result.pricingProvider]["7_days"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                    prices[key] = fullPricesJSON[key][result.pricingProvider]["7_days"]["median"]
                                }
                                else {
                                    prices[key] = "null";
                                    console.log(key);
                                }
                            }
                        }
                        else if(result.pricingMode === pricingProviders.csgobackpack.pricing_modes["24_hours_average"].name){
                            for (const key of keys) {
                                if (fullPricesJSON[key][result.pricingProvider]["24_hours"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                    prices[key] = fullPricesJSON[key][result.pricingProvider]["24_hours"]["average"]
                                }
                                else {
                                    prices[key] = "null";
                                    console.log(key);
                                }
                            }
                        }
                        else if(result.pricingMode === pricingProviders.csgobackpack.pricing_modes["24_hours_median"].name){
                            for (const key of keys) {
                                if (fullPricesJSON[key][result.pricingProvider]["24_hours"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                    prices[key] = fullPricesJSON[key][result.pricingProvider]["24_hours"]["median"]
                                }
                                else {
                                    prices[key] = "null";
                                    console.log(key);
                                }
                            }
                        }
                        else if(result.pricingMode === pricingProviders.csgobackpack.pricing_modes["30_days_average"].name){
                            for (const key of keys) {
                                if (fullPricesJSON[key][result.pricingProvider]["30_days"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                    prices[key] = fullPricesJSON[key][result.pricingProvider]["30_days"]["average"]
                                }
                                else {
                                    prices[key] = "null";
                                    console.log(key);
                                }
                            }
                        }
                        else if(result.pricingMode === pricingProviders.csgobackpack.pricing_modes["30_days_median"].name){
                            for (const key of keys) {
                                if (fullPricesJSON[key][result.pricingProvider]["30_days"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                    prices[key] = fullPricesJSON[key][result.pricingProvider]["30_days"]["median"]
                                }
                                else {
                                    prices[key] = "null";
                                    console.log(key);
                                }
                            }
                        }
                        else if(result.pricingMode === pricingProviders.csgobackpack.pricing_modes["all_time_average"].name){
                            for (const key of keys) {
                                if (fullPricesJSON[key][result.pricingProvider]["all_time"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                    prices[key] = fullPricesJSON[key][result.pricingProvider]["all_time"]["average"]
                                }
                                else {
                                    prices[key] = "null";
                                    console.log(key);
                                }
                            }
                        }
                        else if(result.pricingMode === pricingProviders.csgobackpack.pricing_modes["all_time_median"].name){
                            for (const key of keys) {
                                if (fullPricesJSON[key][result.pricingProvider]["all_time"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                    prices[key] = fullPricesJSON[key][result.pricingProvider]["all_time"]["median"]
                                }
                                else {
                                    prices[key] = "null";
                                    console.log(key);
                                }
                            }
                        }
                    else {
                        prices[key] = "null";
                        console.log(key);
                    }
                }
                else if(result.pricingProvider === pricingProviders.bitskins.name){
                    if(result.pricingMode === pricingProviders.bitskins.pricing_modes.bitskins.name){
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined && fullPricesJSON[key][result.pricingProvider]["price"] !== undefined) {
                                prices[key] = fullPricesJSON[key][result.pricingProvider]["price"];
                            }
                            else {
                                prices[key] = "null";
                                console.log(key);
                            }
                        }
                    }
                    else if(result.pricingMode === pricingProviders.bitskins.pricing_modes.instant_sale.name){
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined && fullPricesJSON[key][result.pricingProvider]["instant_sale_price"] !== undefined) {
                                prices[key] = fullPricesJSON[key][result.pricingProvider]["instant_sale_price"];
                            }
                            else {
                                prices[key] = "null";
                                console.log(key);
                            }
                        }
                    }
                }
                else if(result.pricingProvider === pricingProviders.lootfarm.name || result.pricingProvider === pricingProviders.csgotm.name || result.pricingProvider === pricingProviders.csgotrader.name){
                    for (const key of keys) {
                        if(fullPricesJSON[key][result.pricingProvider] !== undefined){
                            prices[key] = fullPricesJSON[key][result.pricingProvider];
                        }
                        else{
                            prices[key] = "null";
                        }
                    }
                }
                else if(result.pricingProvider === pricingProviders.csmoney.name){
                    for (const key of keys) {
                        if(fullPricesJSON[key][result.pricingProvider] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null"){
                            if(fullPricesJSON[key][result.pricingProvider]["doppler"] !== "null"){
                                //TODO handle dopplers
                            }
                            else{
                                prices[key] = fullPricesJSON[key][result.pricingProvider]["price"];
                            }
                        }
                        else{
                            prices[key] = "null";
                        }
                    }
                }
                console.log(prices);
                chrome.storage.local.set({prices: prices,}, function() {});
            }
        });
    });
}

function updateExchangeRates(){
    let request = new Request('https://prices.csgotrader.app/latest/exchange_rates.json');

    fetch(request).then(function(response) {
        return response.json();
    }).then(function(exchangeRatesJSON) {
        chrome.storage.local.set({exchangeRates: exchangeRatesJSON,}, function() {});
        chrome.storage.local.get('currency', function(result) {
            chrome.storage.local.set({exchangeRate: exchangeRatesJSON[result.currency],}, function() {});
        });
    });
}

function prettyPrintPrice(currency, price){
    let nf = new Intl.NumberFormat();
    return currencies[currency].sign + nf.format(price);
}

function getAssetIDOfElement(element){
    return element.id.split("730_2_")[1];
}

function doTheSorting(items, method, pages, type){
    if(method === "price_asc"){
        items = Array.from(items).sort(function(a, b) {
            let priceOfA = parseFloat(getItemByAssetID(getAssetIDOfElement(a)).price.price);
            let priceOfB = parseFloat(getItemByAssetID(getAssetIDOfElement(b)).price.price);
            return priceOfA - priceOfB;
        });
    }
    else if(method === "price_desc"){
        items = Array.from(items).sort(function(a, b) {
            let priceOfA = parseFloat(getItemByAssetID(getAssetIDOfElement(a)).price.price);
            let priceOfB = parseFloat(getItemByAssetID(getAssetIDOfElement(b)).price.price);
            return priceOfB - priceOfA;
        });
    }
    else if(method === "name_asc"){
        items = Array.from(items).sort(function(a, b){
            let nameOfA = getItemByAssetID(getAssetIDOfElement(a)).market_hash_name.toLowerCase();
            let nameOfB = getItemByAssetID(getAssetIDOfElement(b)).market_hash_name.toLowerCase();
            if (nameOfA < nameOfB) {return -1;}
            if (nameOfA > nameOfB) {return 1;}
            return 0;
        });
    }
    else if(method === "name_desc"){
        items = Array.from(items).sort(function(a, b){
            let nameOfA = getItemByAssetID(getAssetIDOfElement(a)).market_hash_name.toLowerCase();
            let nameOfB = getItemByAssetID(getAssetIDOfElement(b)).market_hash_name.toLowerCase();
            if (nameOfA > nameOfB) {return -1;}
            if (nameOfA < nameOfB) {return 1;}
            return 0;
        });
    }
    else if(method === "tradability_asc"){
        items = Array.from(items).sort(function(a, b){
            let tradabilityOfA = getItemByAssetID(getAssetIDOfElement(a)).tradability;
            let tradabilityOfB = getItemByAssetID(getAssetIDOfElement(b)).tradability;
            if(tradabilityOfA === "Tradable"){return -1}
            else if(tradabilityOfA === "Not Tradable"){return 1}
            else if(tradabilityOfB === "Tradable"){return 1}
            else if(tradabilityOfB === "Not Tradable"){return -1}
            else{
                let tradabilityOfATime = new Date(tradabilityOfA);
                tradabilityOfATime = tradabilityOfATime.getTime();
                let tradabilityOfBTime = new Date(tradabilityOfB);
                tradabilityOfBTime = tradabilityOfBTime.getTime();
                if (tradabilityOfATime < tradabilityOfBTime) {return -1;}
                if (tradabilityOfATime > tradabilityOfBTime) {return 1;}
                return 0;
            }
        });
    }
    else if(method === "tradability_desc"){
        items = Array.from(items).sort(function(a, b){
            let tradabilityOfA = getItemByAssetID(getAssetIDOfElement(a)).tradability;
            let tradabilityOfB = getItemByAssetID(getAssetIDOfElement(b)).tradability;
            if(tradabilityOfA === "Tradable"){return 1}
            else if(tradabilityOfA === "Not Tradable"){return -1}
            else if(tradabilityOfB === "Tradable"){return -1}
            else if(tradabilityOfB === "Not Tradable"){return 1}
            else{
                let tradabilityOfATime = new Date(tradabilityOfA);
                tradabilityOfATime = tradabilityOfATime.getTime();
                let tradabilityOfBTime = new Date(tradabilityOfB);
                tradabilityOfBTime = tradabilityOfBTime.getTime();
                if (tradabilityOfATime > tradabilityOfBTime) {return -1;}
                if (tradabilityOfATime < tradabilityOfBTime) {return 1;}
                return 0;
            }
        });
    }
    else if(method === "default"){
        items = Array.from(items).sort(function(a, b){
            let positionOfA = parseInt(getItemByAssetID(getAssetIDOfElement(a)).position);
            let positionOfB = parseInt(getItemByAssetID(getAssetIDOfElement(b)).position);

            if (positionOfA > positionOfB) {return 1;}
            if (positionOfA < positionOfB) {return -1;}
            return 0;

        });
    }
    else if(method === "reverse"){
        items = Array.from(items).sort(function(a, b){
            let positionOfA = parseInt(getItemByAssetID(getAssetIDOfElement(a)).position);
            let positionOfB = parseInt(getItemByAssetID(getAssetIDOfElement(b)).position);

            if (positionOfA > positionOfB) {return -1;}
            if (positionOfA < positionOfB) {return 1;}
            return 0;

        });
    }

    items.reverse();

    let numberOfItemsPerPage = 0;
    type === "offer" ? numberOfItemsPerPage = 16 : numberOfItemsPerPage = 25;

    pages.forEach(function (page) {
        page.innerHTML = "";
        for( let i = 0; i <numberOfItemsPerPage ; i++){
            let item = items.pop();
            if(item !== undefined){
                page.append(item.parentElement);
            }
        }
    });
}

function isSIHActive(){
    let SIHSwitch = document.getElementById("switchPanel");
    let SIHSwitcherCheckbox = document.getElementById("switcher");
    return (SIHSwitch !== null && SIHSwitcherCheckbox !== null && SIHSwitcherCheckbox.checked)
}