Number.prototype.toFixedNoRounding = function(n) {
    const reg = new RegExp('^-?\\d+(?:\\.\\d{0,' + n + '})?', 'g');
    const a = this.toString().match(reg)[0];
    const dot = a.indexOf('.');
    if (dot === -1) return a + '.' + '0'.repeat(n); // integer, insert decimal dot and pad up zeros
    const b = n - (a.length - dot) + 1;
    return b > 0 ? (a + '0'.repeat(b)) : a;
};

const ruby = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/redjewel" class="gemIcon">';
const sapphire = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/bluejewel" class="gemIcon">';
const emerald = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/greenjewel" class="gemIcon">';
const blackPearl = '<img src="https://steamcommunity-a.akamaihd.net/economy/emoticon/lltqjewel" class="gemIcon">';

let floatQueue = {
    active: false,
    jobs: []
};

function getPattern(name, paint_seed) {
    if (/ Marble Fade /i.test(name)) {
        let pattern = null;
        if (/Karambit/i.test(name)) pattern = patterns.marble_fades.karambit[paint_seed];
        else if (/Butterfly/i.test(name)) pattern = patterns.marble_fades.butterfly[paint_seed];
        else if (/M9 Bayonet/i.test(name)) pattern = patterns.marble_fades.m9[paint_seed];
        else if (/Bayonet/i.test(name)) pattern = patterns.marble_fades.bayonet[paint_seed];
        else if (/Talon/i.test(name)) pattern = patterns.marble_fades.talon[paint_seed];
        else if (/Stiletto/i.test(name)) pattern = patterns.marble_fades.stiletto[paint_seed];
        else if (/Navaja/i.test(name)) pattern = patterns.marble_fades.navaja[paint_seed];
        else if (/Ursus/i.test(name)) pattern = patterns.marble_fades.ursus[paint_seed];
        else if (/Huntsman/i.test(name)) pattern = patterns.marble_fades.huntsman[paint_seed];
        else if (/Flip/i.test(name)) pattern = patterns.marble_fades.flip[paint_seed];
        else if (/Bowie/i.test(name)) pattern = patterns.marble_fades.bowie[paint_seed];
        else if (/Daggers/i.test(name)) pattern = patterns.marble_fades.daggers[paint_seed];
        else if (/Gut/i.test(name)) pattern = patterns.marble_fades.gut[paint_seed];
        else if (/Falchion/i.test(name)) pattern = patterns.marble_fades.falchion[paint_seed];
        else return null;

        if (pattern !== null && pattern !== undefined) return {type: 'marble_fade', value: pattern};
        else return null;
    }
    else if (/ Fade /i.test(name)){
        let percentage = null;
        if (/Karambit/i.test(name)) percentage = patterns.fades.karambit[paint_seed];
        else if (/Butterfly/i.test(name)) percentage = patterns.fades.butterfly[paint_seed];
        else if (/M9 Bayonet/i.test(name)) percentage = patterns.fades.m9[paint_seed];
        else if (/Bayonet/i.test(name)) percentage = patterns.fades.bayonet[paint_seed];
        else if (/Talon/i.test(name)) percentage = patterns.fades.talon[paint_seed];
        else if (/Stiletto/i.test(name)) percentage = patterns.fades.stiletto[paint_seed];
        else if (/Navaja/i.test(name)) percentage = patterns.fades.navaja[paint_seed];
        else if (/Ursus/i.test(name)) percentage = patterns.fades.ursus[paint_seed];
        else if (/Huntsman/i.test(name)) percentage = patterns.fades.huntsman[paint_seed];
        else if (/Flip/i.test(name)) percentage = patterns.fades.flip[paint_seed];
        else if (/Bowie/i.test(name)) percentage = patterns.fades.bowie[paint_seed];
        else if (/Daggers/i.test(name)) percentage = patterns.fades.daggers[paint_seed];
        else if (/Gut/i.test(name)) percentage = patterns.fades.gut[paint_seed];
        else if (/Falchion/i.test(name)) percentage = patterns.fades.falchion[paint_seed];
        else if (/Glock/i.test(name)) percentage = patterns.fades.glock[paint_seed];
        else return null;

        if(percentage !== null && percentage !== undefined) return {type: 'fade', value: `${percentage}% Fade`};
        else return null;
    }
    else if (/ Case Hardened/i.test(name)) {
        let pattern = null;
        if (/AK-47/i.test(name)) pattern = patterns.case_hardeneds.ak[paint_seed];
        else if (/Butterfly/i.test(name)) pattern = patterns.case_hardeneds.butterfly[paint_seed];
        else if (/M9 Bayonet/i.test(name)) pattern = patterns.case_hardeneds.m9[paint_seed];
        else if (/Bayonet/i.test(name)) pattern = patterns.case_hardeneds.bayonet[paint_seed];
        else if (/Talon/i.test(name)) pattern = patterns.case_hardeneds.talon[paint_seed];
        else if (/Stiletto/i.test(name)) pattern = patterns.case_hardeneds.stiletto[paint_seed];
        else if (/Navaja/i.test(name)) pattern = patterns.case_hardeneds.navaja[paint_seed];
        else if (/Ursus/i.test(name)) pattern = patterns.case_hardeneds.ursus[paint_seed];
        else if (/Huntsman/i.test(name)) pattern = patterns.case_hardeneds.huntsman[paint_seed];
        else if (/Flip/i.test(name)) pattern = patterns.case_hardeneds.flip[paint_seed];
        else if (/Bowie/i.test(name)) pattern = patterns.case_hardeneds.bowie[paint_seed];
        else if (/Daggers/i.test(name)) pattern = patterns.case_hardeneds.daggers[paint_seed];
        else if (/Gut/i.test(name)) pattern = patterns.case_hardeneds.gut[paint_seed];
        else if (/Falchion/i.test(name)) pattern = patterns.case_hardeneds.falchion[paint_seed];
        else if (/Karambit/i.test(name)) pattern = patterns.case_hardeneds.karambit[paint_seed];
        else if (/Five-SeveN/i.test(name)) pattern = patterns.case_hardeneds.five_seven[paint_seed];
        else return null;

        if (pattern !== null && pattern !== undefined) return {type: 'case_hardened', value: pattern};
        else return null; // return {type: 'case_hardened', value: 'Not special or not found'};
    }
    else return null;
}

function getQuality(tags) {
    if (tags !== undefined) {
        for (let tag of tags) if (tag.category === 'Rarity') {
            for (let rarity in rarities) {
                if (rarities[rarity].internal_name === tag.internal_name) return qualities[rarities[rarity].name];
            }

            // if the rarity is unknown to the extension
            console.log(tag.internal_name);
            return qualities.stock;
        }
    }
    return null;
}

function getType(tags) {
    if (tags !== undefined) {
        for (let tag of tags) if (tag.category === 'Type') {
            for (let itemType in itemTypes) {
                if (itemTypes[itemType].internal_name === tag.internal_name) return itemTypes[itemType];
            }

            // if the category is unknown to the extension - for example a new item type was introduced
            console.log(tag.internal_name);
            return itemTypes.unknown_type;
        }
    }
    return null;
}

function getExteriorFromTags(tags) {
    if (tags !== undefined) {
        for (let tag of tags) {
            if (tag.category === 'Exterior') {
                for (let exterior in exteriors) {
                    if (exteriors[exterior].internal_name === tag.internal_name) return exteriors[exterior];
                }

                // no exterior
                return null;
            }
        }
    }
    return null;
}

function getDopplerInfo(icon) {
    switch (icon) {
        // guts
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

        // daggers
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

        // falchions
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

        // bowies
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

        // flips
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

        // huntsmans
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

        // bayonets
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

        // m9s
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

        // butterlies
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

        // karambits
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

        // gamma guts
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

        // gamma flips
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

        // gamma bayonet
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

        // gamma m9s
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

        // gamma karambits
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

        // stilettos
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20k_jkI7fUhFRB4MRij7j--YXygED6_kptYWmnINDAe1U_MFqE-AK8kubsgZC6vZTBy3dm7iAjty6OmRG0gAYMMLJXF6TfvA":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20k_jkI7fUhFRB4MRij7v--YXygED6_hZvNmH6dYCTIQQ9Ml3XrwTvwLi615K46s_Pmns1uXJ34SnYmBKw0AYMMLKAKIcTNQ":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20k_jkI7fUhFRB4MRij7r--YXygED6r0ZqZGv2JtKXJgc-ZlCG_1C2wOa6gZe4vs-cmyFrvyUr5S2LzRO10AYMMLIC5GArWw":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20k_jkI7fUhFRB4MRij73--YXygED6-0RoMWr3I9XAIQY9Mg6G-1e7krzq0Za06JSdznY1s3F3sH6OyR2-0gYMMLJWWwFisg":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0J3fwIYGTIFdsaF-EqFXrxue-hcW9vpifwXRi6yQn4S7dzBLm001Ebedtm7XAHnagFOkl":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20heL2KoTcl3lT5MB4kOzFyoD8j1yg5RA5MjylcIKdIwA_ZVmF8ljqwuvn1pK9uJzBmyZmvSAi4yzanBHlhhBSLrs4mlbW1wk":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfThW-NOJlY20lfv1MLDBk2pD5Pp8i_vD-Yn8klGwlB81NDG3Oo-QIQA7ZFnSqVG9wuju0cfpucvLnHNivyFw7HrbmEGxgBxOaOFu1qCACQLJ4GHavAc":
            return dopplerPhases.bp;

        // ursuses
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJkI-bh_vxIYTBnmpC7ZROhuDG_Zi7jQWy-UFqN2r7INDDdAVsMAmD8lLql7vvhJPq75jLzXYysnIn7XbVmQv3309_tWjVng":
            return dopplerPhases.p1;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJkI-bh_vxIYTBnmpC7ZdOhuDG_Zi7iwLn_UVpZGrzcYKdcg82Z13U_FS-l7znjZ60tMzKmHRju3VwsX-LmAv330-XRUGjkQ":
            return dopplerPhases.p2;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJkI-bh_vxIYTBnmpC7ZZOhuDG_Zi70FbnqhVkMG7yJISQelc7N1rW-VW2yObngcS_78iazyA2vXYqsXjazQv330_A0SwGew":
            return dopplerPhases.p3;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJkI-bh_vxIYTBnmpC7ZFOhuDG_Zi7jgWw_hJsYjygIYDEdFdraV2FrFfql-jo05bvv5ibzXFjsiYn7XbVmAv3309R3fUXZg":
            return dopplerPhases.p4;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJh4Gbh__9Ib7um2pD6sl0g_PE8bP5gVO8v11tZD3yItfHcAE-ZQnR8lK5xL-6hZK_7pTMzHs26HQmsHzemxO20h5LcKUx0sWcYFnz":
            return dopplerPhases.sh;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJhpWJjsj5MqnTmm5Y8sB1teXI8oThxlDtrRdtammhJI6WdVNoZA3U8gC-ye3sjZe175rNyCBnuiEh5nyLmxCpwUYbZYr74y0":
            return dopplerPhases.rb;
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxuHbZC597dGJloyKlPzkNrrDmlRc6ddzhuzI74nxt1i9rBsofW-gLdORJw42ZV6D_lG4kuy71Me9tZ3MwSdgsyl3tCzdn0DhgB1EbeBxxavJfwNOLfc":
            return dopplerPhases.bp;

        // navajas
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

        // talons
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
        case "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfxPrMfipP7dezhr-Kmsj2P7rSnXtU6dd9teTA5475jV2urhcDPzCkfMKLdFQ4NQ2CrAW2xe--hZ-9v56czXUxu3F0sH7UnkHk1BFMb-RshfDMSELeWfKHiE2NFw":
            return dopplerPhases.bp;

        default: return dopplerPhases.unk;
    }
}

function getShortDate(tradabibilityDate) {
    if (tradabibilityDate === 'Tradable' || tradabibilityDate === '') return 'T';
    let now = new Date().getTime();
    let distance = new Date(tradabibilityDate) - now;
    if (distance <= 0) return 'T';

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
    if (days === 0) {
        if (hours === 0) {
            if (minutes === 0) {
                if (seconds === 0) return '';
                else return `${seconds}s`;
            }
            else return `${minutes}m`;
        }
        else return `${hours}h`;
    }
    else return `${days}d`;
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

    let collectionsWithSouvenirstoCheck = new RegExp(collectionsWithSouvenirs.join('|'), 'i');
    return collectionsWithSouvenirstoCheck.test(iteminfo);

}

function goToInternalPage(targetURL) {
    chrome.tabs.query({}, (tabs) => {
        for (let i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url === ('chrome-extension://'+ chrome.runtime.id + targetURL)) { // TODO make this work in firefox or remove the whole thing
                chrome.tabs.reload(tab.id, {}, () => {});
                chrome.tabs.update(tab.id, {active: true});
                return;
            }
        }
        chrome.tabs.create({url: targetURL});
    });
}

function determineNotificationDate(tradableDate, minutesOrHours, numberOfMinutesOrHours, beforeOrAfter) {
    let baseTimeUnit = 0;
    if (minutesOrHours === 'minutes') baseTimeUnit = 60;
    else if (minutesOrHours === 'hours') baseTimeUnit = 3600;
    if (beforeOrAfter === 'before') baseTimeUnit *= -1;
    let timeDifference = numberOfMinutesOrHours * baseTimeUnit;
    return new Date((parseInt((new Date(tradableDate).getTime() / 1000).toFixed(0)) + timeDifference) * 1000);
}

function reverseWhenNotifDetails(tradability, notifTime) {
    let difference = (parseInt(new Date(notifTime).getTime() / 1000).toFixed(0)) - (parseInt(new Date(tradability).getTime() / 1000).toFixed(0));
    let differenceAbs =  Math.abs(difference);
    let beforeOrAfter = difference >= 0 ? 'after' : 'before';
    let minutesOrHours = differenceAbs / 60 >= 60 ? 'hours' : 'minutes';
    let numberOfMinutesOrHours = differenceAbs / 60 >= 60 ? ( differenceAbs / 60) / 60 : differenceAbs / 60;

    return {
        numberOfMinutesOrHours: numberOfMinutesOrHours,
        minutesOrHours: minutesOrHours,
        beforeOrAfter: beforeOrAfter
    };
}

// there are many different kinds of SteamID formats , this function converts the 64bit into the ones used in trade offers
function getOfferStyleSteamID(steamID64) {return Number(steamID64.split('7656')[1]) - Number(1197960265728)}

// converts shitty annoying trade offer style SteamID to proper SteamID64
function getPoperStyleSteamIDFromOfferStyle(offerStyleID) { return '7656' + (Number(offerStyleID) + Number(1197960265728))}

// gets the steam id of the user that's profile this script is run on
function getProfileOwnerSteamID() {
    let steamidOfProfileOwnerScript = `document.querySelector('body').setAttribute('steamidOfProfileOwner', g_rgProfileData.steamid);`;
    return injectToPage(steamidOfProfileOwnerScript, true, 'steamidOfProfileOwner', 'steamidOfProfileOwner');
}

// gets SteamID of the user logged into steam (returns false if there is no user logged in)
function getUserSteamID() {
    let getUserSteamIDScript = `document.querySelector('body').setAttribute('steamidOfLoggedinUser', g_steamID);`;
    return injectToPage(getUserSteamIDScript, true, 'steamidOfLoggedinUser', 'steamidOfLoggedinUser');
}

// gets the other party's steam id in a trade offer
function getTradePartnerSteamID() {
    let tradePartnerSteamIDScript = `document.querySelector('body').setAttribute('tradePartnerSteamID', g_ulTradePartnerSteamID);`;
    return injectToPage(tradePartnerSteamIDScript, true, 'tradePartnerSteamID', 'tradePartnerSteamID')
}

function getInventoryOwnerID() {
    let inventoryOwnerIDScript = `document.querySelector('body').setAttribute('inventoryOwnerID', UserYou.GetSteamId());`;
    return injectToPage(inventoryOwnerIDScript, true, 'inventoryOwnerID', 'inventoryOwnerID')
}

function warnOfScammer(steamID, page) {
    chrome.runtime.sendMessage({getSteamRepInfo: steamID}, (response) => {
        if(response.SteamRepInfo !== 'error') {
            if (response.SteamRepInfo.reputation.summary === 'SCAMMER') {
                let backgroundURL = chrome.runtime.getURL('images/scammerbackground.jpg');
                document.querySelector('body').insertAdjacentHTML('beforebegin', `<div style="background-color: red; color: white; padding: 5px; text-align: center;" class="scammerWarning"><span>Watch out, this user was banned on SteamRep for scamming! You can check the details of what they did on <a style="color: black; font-weight: bold" href='https://steamrep.com/profiles/${steamID}'>steamrep.com</a></span></div>`);

                if (page === 'offer')   document.querySelector('body').setAttribute('style', `background-image: url('${backgroundURL}')`);
                else if (page === 'profile') document.querySelector('.no_header.profile_page').setAttribute('style', `background-image: url('${backgroundURL}')`);
            }
        }
        else console.log('Could not get SteamRep info');
    });
}

function parseStickerInfo(descriptions, linkType) {
    if (descriptions !== undefined && linkType !== undefined) {
        let stickers = [];
        let link = linkType === 'search' ? 'https://steamcommunity.com/market/search?q=' : 'https://steamcommunity.com/market/listings/730/Sticker%20%7C%20';

        descriptions.forEach((description) => {
            if (/sticker_info/.test(description.value)) {
                let names = description.value.split('><br>')[1].split(': ')[1].split('</center>')[0].split(', ');
                names = handleStickerNamesWithCommas(names);
                let iconURLs = description.value.split('src="');
                iconURLs.shift();
                iconURLs.forEach((iconURL, index) => {
                    iconURLs[index] = iconURL.split('><')[0]
                });
                names.forEach((name, index) => {
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
    else return null
}

function handleStickerNamesWithCommas(names) {
    let nameWithCommaFound = false;

    names.forEach((name, index) => {
        if(name === 'Don\'t Worry' && names[index + 1] === 'I\'m Pro') {
            names[index] = 'Don\'t Worry, I\'m Pro';
            names = removeFromArray(names, index + 1);
            nameWithCommaFound = true;
        }
    });

    if(nameWithCommaFound) return handleStickerNamesWithCommas(names);
    else return names;
}

function removeFromArray(array, arrayIndex) {
    let newArray = [];
    array.forEach((element, index) => {if (index !== arrayIndex) newArray.push(element)});
    return newArray;
}

function addReplytoCommentsFunctionality() {
    document.querySelectorAll('.commentthread_comment_actions').forEach(commentThread => {
        if (commentThread.querySelector('.replybutton') === null) {
            commentThread.insertAdjacentHTML('beforeend', `<a class="actionlink replybutton" data-tooltip-text="Reply"><img style="height: 16px; width: 16px" src="${chrome.runtime.getURL("images/reply.png")}"></a>`);
        }
    });

    document.querySelectorAll('.replybutton').forEach(replyButton => {
        // if there was one previously added
        replyButton.removeEventListener('click', handleReplyToCommentFunctionality);

        replyButton.addEventListener('click', handleReplyToCommentFunctionality);
    });
}

function handleReplyToCommentFunctionality(event) {
    // analytics
    trackEvent({
        type: 'event',
        action: 'CommentReply'
    });

    let commenterName = event.target.parentNode.parentNode.parentNode.querySelector('.commentthread_author_link').querySelector('bdi').innerHTML.split(' <span class="nickname_block">')[0];
    let commentTextarea = document.querySelector('.commentthread_textarea');
    let currentContent = commentTextarea.value;

    if (currentContent === '') commentTextarea.value = `[b]@${commenterName}[/b]: `;
    else commentTextarea.value = `${currentContent}\n[b]@${commenterName}[/b]: `;

    commentTextarea.focus();
}

function addCommentsMutationObserver() {
    let observer = new MutationObserver(() => {addReplytoCommentsFunctionality()});

    let commentThread = document.querySelector('.commentthread_comments');

    if (commentThread  !== null) {
        observer.observe(commentThread, {
            subtree: true,
            attributes: false,
            childList: true
        })
    }
}

function reportComments() {
    chrome.storage.local.get(['flagScamComments', 'customCommentsToReport'], (result) => {
        if (result.flagScamComments) {
            let mergedStringToReport = result.customCommentsToReport.concat(commentsToReport);
            let spamTextCheck = new RegExp(mergedStringToReport.join('|'), 'i');

            document.querySelectorAll('.commentthread_comment.responsive_body_text').forEach(comment => {
                if (spamTextCheck.test(comment.querySelector('.commentthread_comment_text').innerText) && !comment.classList.contains('hidden_post')){
                    // analytics
                    trackEvent({
                        type: 'event',
                        action: 'CommentReported'
                    });
                    comment.querySelector('a.report_and_hide').querySelector('img').click();
                }
            });
        }
    });
}

function addDopplerPhase(item, dopplerInfo) {
    if (dopplerInfo !== undefined) {
        let dopplerDiv = document.createElement('div');
        dopplerDiv.classList.add('dopplerPhase');

        switch (dopplerInfo.short) {
            case 'SH': dopplerDiv.insertAdjacentHTML('beforeend', sapphire); break;
            case 'RB': dopplerDiv.insertAdjacentHTML('beforeend', ruby); break;
            case 'EM': dopplerDiv.insertAdjacentHTML('beforeend', emerald); break;
            case 'BP': dopplerDiv.insertAdjacentHTML('beforeend', blackPearl); break;
            default: dopplerDiv.innerText = dopplerInfo.short;
        }

        item.appendChild(dopplerDiv);
    }
}

function updatePrices() {
    let headers = new Headers();
    headers.append('Accept-Encoding', 'gzip');
    let init = { method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default' };

    let request = new Request('https://prices.csgotrader.app/latest/prices_v2.json', init);

    fetch(request).then((response) => {
        if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        return response.json();
    }).then((fullPricesJSON) => {
        chrome.storage.local.get(['itemPricing', 'pricingProvider', 'pricingMode'], (result) => {
            if(result.itemPricing) {
                let prices = {};
                const keys = Object.keys(fullPricesJSON);
                if (result.pricingProvider === pricingProviders.csgobackpack.name) {
                    if (result.pricingMode === pricingProviders.csgobackpack.pricing_modes["7_days_average"].name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider]["7_days"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["7_days"]["average"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else if (result.pricingMode === pricingProviders.csgobackpack.pricing_modes["7_days_median"].name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider]["7_days"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["7_days"]["median"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else if (result.pricingMode === pricingProviders.csgobackpack.pricing_modes["24_hours_average"].name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider]["24_hours"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["24_hours"]["average"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else if (result.pricingMode === pricingProviders.csgobackpack.pricing_modes["24_hours_median"].name){
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider]["24_hours"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["24_hours"]["median"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else if (result.pricingMode === pricingProviders.csgobackpack.pricing_modes["30_days_average"].name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider]["30_days"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["30_days"]["average"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else if (result.pricingMode === pricingProviders.csgobackpack.pricing_modes["30_days_median"].name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider]["30_days"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["30_days"]["median"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else if (result.pricingMode === pricingProviders.csgobackpack.pricing_modes["all_time_average"].name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider]["all_time"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["all_time"]["average"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else if (result.pricingMode === pricingProviders.csgobackpack.pricing_modes["all_time_median"].name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider]["all_time"] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["all_time"]["median"]}
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else {
                        prices[key] = {"price": "null"};
                        console.log(key);
                    }
                }
                else if (result.pricingProvider === pricingProviders.bitskins.name) {
                    if (result.pricingMode === pricingProviders.bitskins.pricing_modes.bitskins.name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined && fullPricesJSON[key][result.pricingProvider]["price"] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["price"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                    else if (result.pricingMode === pricingProviders.bitskins.pricing_modes.instant_sale.name) {
                        for (const key of keys) {
                            if (fullPricesJSON[key][result.pricingProvider] !== "null" && fullPricesJSON[key][result.pricingProvider] !== undefined && fullPricesJSON[key][result.pricingProvider]["instant_sale_price"] !== undefined) {
                                prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]["instant_sale_price"]};
                            }
                            else {
                                prices[key] = {"price": "null"};
                                console.log(key);
                            }
                        }
                    }
                }
                else if (result.pricingProvider === pricingProviders.lootfarm.name || result.pricingProvider === pricingProviders.csgotm.name) {
                    for (const key of keys) {
                        if (fullPricesJSON[key][result.pricingProvider] !== undefined) {
                            prices[key] = {"price": fullPricesJSON[key][result.pricingProvider]};
                        }
                        else{
                            prices[key] = {"price": "null"};
                        }
                    }
                }
                else if (result.pricingProvider === pricingProviders.csmoney.name || result.pricingProvider === pricingProviders.csgotrader.name) {
                    for (const key of keys) {
                        prices[key] = {"price": "null", "doppler": "null"};
                        if (fullPricesJSON[key][result.pricingProvider] !== undefined && fullPricesJSON[key][result.pricingProvider] !== "null") {
                            if (fullPricesJSON[key][result.pricingProvider]["doppler"] !== "null" && fullPricesJSON[key][result.pricingProvider]["doppler"] !== undefined) {
                                prices[key]["doppler"] = fullPricesJSON[key][result.pricingProvider]["doppler"];
                            }
                            prices[key]["price"] =  fullPricesJSON[key][result.pricingProvider]["price"];
                        }
                    }
                }
                console.log(prices);
                chrome.storage.local.set({prices: prices}, () => {});
            }
        });
    }).catch((err) => {console.log(err)});
}

function updateExchangeRates() {
    let request = new Request('https://prices.csgotrader.app/latest/exchange_rates.json');

    fetch(request).then((response) => {
        if (!response.ok) console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        return response.json();
    }).then((exchangeRatesJSON) => {
        chrome.storage.local.set({exchangeRates: exchangeRatesJSON}, () =>{});
        chrome.storage.local.get('currency', (result) => {chrome.storage.local.set({exchangeRate: exchangeRatesJSON[result.currency]}, () => {})});
    }).catch((err) => {console.log(err)});
}

function prettyPrintPrice(currency, price) {
    let nf = new Intl.NumberFormat();

    if (price >= 0) return currencies[currency].sign + nf.format(price);
    else return `-${currencies[currency].sign}${nf.format(Math.abs(price))}`
}

function getAssetIDOfElement(element) {
    if (element === null) return null;
    let assetID = element.id.split('730_2_')[1];
    return assetID === undefined ? null : assetID;
}

function doTheSorting(items, itemElements, method, pages, type) {
    if (method === "price_asc") {
        itemElements = itemElements.sort((a, b) => {
            let priceOfA = getItemByAssetID(items, getAssetIDOfElement(a)).price !== undefined ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(a)).price.price) : 0.0;
            let priceOfB = getItemByAssetID(items, getAssetIDOfElement(b)).price !== undefined ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(b)).price.price) : 0.0;
            return priceOfA - priceOfB;
        });
    }
    else if (method === "price_desc") {
        itemElements = itemElements.sort((a, b) => {
            let priceOfA = getItemByAssetID(items, getAssetIDOfElement(a)).price !== undefined ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(a)).price.price) : 0.0;
            let priceOfB = getItemByAssetID(items, getAssetIDOfElement(b)).price !== undefined ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(b)).price.price) : 0.0;
            return priceOfB - priceOfA;
        });
    }
    else if (method === "name_asc") {
        itemElements = itemElements.sort((a, b) => {
            let nameOfA = getItemByAssetID(items, getAssetIDOfElement(a)).market_hash_name.toLowerCase();
            let nameOfB = getItemByAssetID(items, getAssetIDOfElement(b)).market_hash_name.toLowerCase();
            if (nameOfA < nameOfB) return -1;
            if (nameOfA > nameOfB) return 1;
            return 0;
        });
    }
    else if (method === "name_desc") {
        itemElements = itemElements.sort((a, b) => {
            let nameOfA = getItemByAssetID(items, getAssetIDOfElement(a)).market_hash_name.toLowerCase();
            let nameOfB = getItemByAssetID(items, getAssetIDOfElement(b)).market_hash_name.toLowerCase();
            if (nameOfA > nameOfB) return -1;
            if (nameOfA < nameOfB) return 1;
            return 0;
        });
    }
    else if (method === "tradability_asc") {
        itemElements = itemElements.sort((a, b) => {
            let tradabilityOfA = getItemByAssetID(items, getAssetIDOfElement(a)).tradability;
            let tradabilityOfB = getItemByAssetID(items, getAssetIDOfElement(b)).tradability;
            if (tradabilityOfA === "Tradable") return -1;
            else if (tradabilityOfA === "Not Tradable") return 1;
            else if (tradabilityOfB === "Tradable") return 1;
            else if (tradabilityOfB === "Not Tradable")return -1;
            else {
                let tradabilityOfATime = new Date(tradabilityOfA);
                tradabilityOfATime = tradabilityOfATime.getTime();
                let tradabilityOfBTime = new Date(tradabilityOfB);
                tradabilityOfBTime = tradabilityOfBTime.getTime();
                if (tradabilityOfATime < tradabilityOfBTime) return -1;
                if (tradabilityOfATime > tradabilityOfBTime) return 1;
                return 0;
            }
        });
    }
    else if (method === "tradability_desc") {
        itemElements = itemElements.sort((a, b) => {
            let tradabilityOfA = getItemByAssetID(items, getAssetIDOfElement(a)).tradability;
            let tradabilityOfB = getItemByAssetID(items, getAssetIDOfElement(b)).tradability;
            if (tradabilityOfA === "Tradable") return 1;
            else if(tradabilityOfA === "Not Tradable") return -1;
            else if(tradabilityOfB === "Tradable") return -1;
            else if(tradabilityOfB === "Not Tradable") return 1;
            else {
                let tradabilityOfATime = new Date(tradabilityOfA);
                tradabilityOfATime = tradabilityOfATime.getTime();
                let tradabilityOfBTime = new Date(tradabilityOfB);
                tradabilityOfBTime = tradabilityOfBTime.getTime();
                if (tradabilityOfATime > tradabilityOfBTime) return -1;
                if (tradabilityOfATime < tradabilityOfBTime) return 1;
                return 0;
            }
        });
    }
    else if (method === "float_asc") {
        itemElements = itemElements.sort((a, b) => {
            let floatInfoOfA = getItemByAssetID(items, getAssetIDOfElement(a)).floatInfo;
            let floatInfoOfB = getItemByAssetID(items, getAssetIDOfElement(b)).floatInfo;

            if (floatInfoOfA === null && floatInfoOfB !== null) return 1;
            else if (floatInfoOfA !== null && floatInfoOfB === null) return -1;
            else if (floatInfoOfA === null && floatInfoOfB === null) return 0;

            let floatOfA = parseFloat(floatInfoOfA.floatvalue);
            let floatOfB = parseFloat(floatInfoOfB.floatvalue);

            if (floatOfA > floatOfB) return 1;
            if (floatOfA < floatOfB) return -1;
            return 0;
        });
    }
    else if (method === "float_desc") {
        itemElements = itemElements.sort((a, b) => {
            let floatInfoOfA = getItemByAssetID(items, getAssetIDOfElement(a)).floatInfo;
            let floatInfoOfB = getItemByAssetID(items, getAssetIDOfElement(b)).floatInfo;

            if (floatInfoOfA === null && floatInfoOfB !== null) return 1;
            else if (floatInfoOfA !== null && floatInfoOfB === null) return -1;
            else if (floatInfoOfA === null && floatInfoOfB === null) return 0;

            let floatOfA = parseFloat(floatInfoOfA.floatvalue);
            let floatOfB = parseFloat(floatInfoOfB.floatvalue);

            if (floatOfA > floatOfB) return -1;
            if (floatOfA < floatOfB) return 1;
            return 0;
        });
    }
    else if (method === "default") {
        itemElements = itemElements.sort((a, b) => {
            let positionOfA = parseInt(getItemByAssetID(items, getAssetIDOfElement(a)).position);
            let positionOfB = parseInt(getItemByAssetID(items, getAssetIDOfElement(b)).position);

            if (positionOfA > positionOfB) return 1;
            if (positionOfA < positionOfB) return -1;
            return 0;
        });
    }
    else if (method === "reverse") {
        itemElements = itemElements.sort((a, b) => {
            let positionOfA = parseInt(getItemByAssetID(items, getAssetIDOfElement(a)).position);
            let positionOfB = parseInt(getItemByAssetID(items, getAssetIDOfElement(b)).position);

            if (positionOfA > positionOfB) return -1;
            if (positionOfA < positionOfB) return 1;
            return 0;
        });
    }

    if (type === 'offer' || type === 'inventory') {
        itemElements.reverse();

        let numberOfItemsPerPage = type === 'offer' ? 16 : 25;

        pages.forEach((page) => {
            page.innerHTML = '';
            for ( let i = 0; i < numberOfItemsPerPage ; i++) {
                let item = itemElements.pop();
                if (item !== undefined) page.appendChild(item.parentElement);
            }
        });
    }
    else if (type === 'your' || type === 'their') {
        itemElements.reverse();
        itemElements.forEach(itemElement => {
            document.getElementById(`${type}_slots`).insertAdjacentElement('afterbegin', itemElement.parentNode.parentNode);
        });
    }
    else return itemElements;
}

function isSIHActive() {
    let SIHSwitch = document.getElementById("switchPanel");
    let SIHSwitcherCheckbox = document.getElementById("switcher");
    return (SIHSwitch !== null && SIHSwitcherCheckbox !== null && SIHSwitcherCheckbox.checked)
}

function getPrice(market_hash_name, dopplerInfo, prices, provider, exchange_rate, currency) {
    let price = 0.0;
    if (provider === pricingProviders.csgotrader.name || provider === pricingProviders.csmoney.name){
        if (dopplerInfo !== undefined) {
            if (prices[market_hash_name] !== undefined && prices[market_hash_name]["doppler"] !== undefined && prices[market_hash_name]["doppler"] !== "null" && prices[market_hash_name]["doppler"][dopplerInfo.name] !== "null" && prices[market_hash_name]["doppler"][dopplerInfo.name] !== undefined){
                price = (prices[market_hash_name]["doppler"][dopplerInfo.name] * exchange_rate).toFixed(2);
            }
            else if (prices[market_hash_name] !== undefined && (prices[market_hash_name]["doppler"] === undefined || prices[market_hash_name]["doppler"][dopplerInfo.name] === undefined || prices[market_hash_name]["doppler"] === "null" || prices[market_hash_name]["doppler"][dopplerInfo.name] === "null") && prices[market_hash_name]["price"] !== "null"){
                price = (prices[market_hash_name]["price"] * exchange_rate).toFixed(2)
            }
        }
        else price =  prices[market_hash_name] === undefined || prices[market_hash_name] === "null" || prices[market_hash_name] === null || prices[market_hash_name]["price"] === undefined || prices[market_hash_name]["price"] === "null" ? 0.0 : (prices[market_hash_name]["price"] * exchange_rate).toFixed(2);
    }
    else price =  prices[market_hash_name] === undefined || prices[market_hash_name] === "null" || prices[market_hash_name] === null || prices[market_hash_name]["price"] === undefined || prices[market_hash_name]["price"] === "null" ? 0.0 : (prices[market_hash_name]["price"] * exchange_rate).toFixed(2);

    return {
        price: price,
        display: price === 0.0 ? "" : currencies[currency].sign + price
    };
}

// inject scripts from content scripts the the page context, usually to access variables or override functionality
function injectToPage(scriptString, toRemove, id, executeAndReturn) {
    // removes previously added instance of the script
    let elementFromBefore = document.getElementById(id);
    if (elementFromBefore !== null) elementFromBefore.parentElement.removeChild(elementFromBefore);

    let toInject = document.createElement('script');
    toInject.id = id;
    toInject.innerHTML = scriptString;
    (document.head || document.documentElement).appendChild(toInject);

    let simpleAttributeParsing = ['steamidOfLoggedinUser', 'steamidOfProfileOwner', 'tradePartnerSteamID', 'inventoryOwnerID', 'listingsInfo',
        'inventoryInfo', 'allItemsLoaded', 'offerInventoryInfo', 'steamWalletCurrency', 'steamWallet', 'formattedToInt', 'intToFormatted',
        'priceAfterFees'];
    let result = simpleAttributeParsing.includes(executeAndReturn) ? document.querySelector('body').getAttribute(executeAndReturn) : null;
    document.querySelector('body').setAttribute(executeAndReturn, '');

    if (toRemove) document.head.removeChild(toInject);
    return result;
}

// updates the SteamID of the extension's user in storage
function updateLoggedInUserID(){
    let steamID = getUserSteamID();
    if (steamID !== 'false' && steamID !== false) chrome.storage.local.set({steamIDOfUser: steamID}, () =>{});
}

// gets the details of an item by matching the passed asset id with the ones from the api call
function getItemByAssetID(items, assetIDToFind) {
    if (items === undefined || items.length === 0) return null;
    return items.filter(item => item.assetid === assetIDToFind)[0];
}

function generateRandomString(length) {
    let text = '';
    let allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) text += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));

    return text;
}

function getAssetIDFromInspectLink(inspectLink) {
    if (inspectLink !== null && inspectLink !== undefined)return inspectLink.split('A')[1].split('D')[0];
    else return null;
}

// if CS:GO is selected - active
function isCSGOInventoryActive(where) {
    if (where === 'offer') return document.getElementById('appselect_activeapp').querySelector('img').src.includes('/730/');
    else if (where === 'inventory') return document.querySelector('.games_list_tab.active').getAttribute('href') === '#730';
}

function extractUsefulFloatInfo(floatInfo) {
    return {
        floatvalue: floatInfo.floatvalue,
        paintindex: floatInfo.paintindex,
        paintseed: floatInfo.paintseed,
        origin_name: floatInfo.origin_name,
        min: floatInfo.min,
        max: floatInfo.max,
        stickers: floatInfo.stickers !== undefined ? floatInfo.stickers : null,
        low_rank: floatInfo.low_rank !== undefined ? floatInfo.low_rank : null
    };
}

function updateFloatCache(assetIDs) {
    assetIDs = arrayFromArrayOrNotArray(assetIDs);

    let floatStorageKeys = [];
    assetIDs.forEach( ID => {floatStorageKeys.push(`floatCache_${ID}`)});

    chrome.storage.local.get(floatStorageKeys, (result) => {
        let itemFloatInfos = {};
        for (let floatKey in result) {
            let itemFloatInfo = result[floatKey];
            if (itemFloatInfo !== undefined && itemFloatInfo !== null) {
                itemFloatInfo.lastUsed = Date.now();
                itemFloatInfo.used = itemFloatInfo.used + 1;
                itemFloatInfos[floatKey] = itemFloatInfo;
            }
        }
        chrome.storage.local.set(itemFloatInfos, () => {});
    });
}

function addToFloatCache(assetID, floatInfo) {
    chrome.storage.local.set({[`floatCache_${assetID}`]:
            {
                floatInfo: floatInfo,
                added: Date.now(),
                lastUsed: Date.now(),
                used: 0
            }
    }, () => {});
}

function addFloatIndicator(itemElement, floatInfo) {
    if (floatInfo !== null && itemElement.querySelector('div.floatIndicator') === null) {
        itemElement.insertAdjacentHTML('beforeend', `<div class="floatIndicator">${floatInfo.floatvalue.toFixedNoRounding(4)}</div>`);
    }
}

function addPriceIndicator(itemElement, priceInfo) {
    if (priceInfo !== undefined && priceInfo !== 'null' && priceInfo !== null) {
        itemElement.insertAdjacentHTML('beforeend', `<div class='priceIndicator'>${priceInfo.display}</div>`);
    }
}

// adds StatTrak, Souvenir and exterior indicators
function addSSTandExtIndicators(itemElement, item) {
    let stattrak = item.isStatrack ? 'ST' : '';
    let souvenir = item.isSouvenir ? 'S' : '';
    let exterior = item.exterior !== null ? item.exterior.localized_short : '';

    itemElement.insertAdjacentHTML('beforeend', `<div class='exteriorSTInfo'><span class="souvenirYellow">${souvenir}</span><span class="stattrakOrange">${stattrak}</span><span class="exteriorIndicator">${exterior}</span></div>`);
}

function makeItemColorful(itemElement, item, colorfulItemsEnabled) {
    if (colorfulItemsEnabled) {
        if (item.dopplerInfo !== undefined) itemElement.setAttribute('style', `background-image: url(); background-color: #${item.dopplerInfo.color}`);
        else itemElement.setAttribute('style', `background-image: url(); background-color: ${item.quality.backgroundcolor}; border-color: ${item.quality.backgroundcolor}`);
    }
}

function arrayFromArrayOrNotArray(arrayOrNotArray) {
    if (!Array.isArray(arrayOrNotArray)) {
        let notArray = arrayOrNotArray;
        arrayOrNotArray = [];
        arrayOrNotArray.push(notArray);
    }
    return arrayOrNotArray
}

function workOnFloatQueue() {
    if (floatQueue.jobs.length !== 0) {
        floatQueue.active = true;
        let job = floatQueue.jobs.shift();

        getFloatInfoFromCache(job.assetID).then(
            floatInfo => {
                if (floatInfo[job.assetID] !== null) {
                    addFloatDataToPage(job, floatQueue, floatInfo[job.assetID]);
                    workOnFloatQueue();
                }
                else {
                    chrome.runtime.sendMessage({fetchFloatInfo: job.inspectLink}, (response) => {
                        if (response === 'error') floatQueue.jobs.push(job);
                        else {
                            if (response !== 'nofloat') addFloatDataToPage(job, floatQueue, response.floatInfo);
                            else {
                                if (job.type === 'inventory_floatbar') hideFloatBars();
                                else if (job.type === 'market') hideFloatBar(job.listingID);
                            }
                        }
                        workOnFloatQueue();
                    });
                }
            }
        );
    }
    else floatQueue.active = false;
}

function addFloatDataToPage(job, floatQueue, floatInfo) {
    if (job.type === 'inventory' || job.type === 'inventory_floatbar' || job.type === 'offer') {
        addFloatIndicator(findElementByAssetID(job.assetID), floatInfo);

        // add float and pattern info to page variable
        let item = (job.type === 'inventory' || job.type === 'inventory_floatbar') ? getItemByAssetID(items, job.assetID) : getItemByAssetID(combinedInventories, job.assetID);
        item.floatInfo = floatInfo;
        item.patternInfo = getPattern(item.market_hash_name, item.floatInfo.paintseed);

        if (job.type === 'inventory_floatbar') {
            if (getAssetIDofActive() === job.assetID) updateFloatAndPatternElements(item);
        }

        // check if there is a floatbar job for the same item and remove it
        if (job.type === 'inventory') {
            floatQueue.jobs.find((floatJob, index) => {
                if (floatJob.type === 'inventory_floatbar' && job.assetID === floatJob.assetID) {
                    updateFloatAndPatternElements(item);
                    removeFromArray(floatQueue, index);
                }
            })
        }
    }
    else if (job.type === 'market') {
        populateFloatInfo(job.listingID, floatInfo);
        setStickerInfo(job.listingID, floatInfo.stickers);
        addPatterns(job.listingID, floatInfo);
    }
    else if (job.type === 'offersPage') {
        addFloatIndicator(selectItemElementByIDs(job.classid, job.instanceid), floatInfo);
    }
}

function getFloatInfoFromCache(assetIDs) {
    return new Promise((resolve, reject) => {
        assetIDs = arrayFromArrayOrNotArray(assetIDs);

        let floatInfoToReturn = {};
        let floatStorageKeys = [];
        assetIDs.forEach( ID => {floatStorageKeys.push(`floatCache_${ID}`)});

        chrome.storage.local.get(floatStorageKeys, (result) => {
            assetIDs.forEach( assetID => {
                let storageKey = `floatCache_${assetID}`;
                let itemFloatCache = result[storageKey];

                if (itemFloatCache !== undefined && itemFloatCache !== null) {
                    floatInfoToReturn[assetID] = itemFloatCache.floatInfo;
                }
                else floatInfoToReturn[assetID] = null;
            });
            updateFloatCache(assetIDs);
            resolve(floatInfoToReturn)
        });
    });
}

function getActivePage(type) {
    let activePage = null;
    if (type === 'inventory') document.querySelectorAll('.inventory_page').forEach(page => {if (page.style.display !== 'none') activePage = page});
    else if (type === 'offer') getActiveInventory().querySelectorAll('.inventory_page').forEach(page => {if (page.style.display !== 'none') activePage = page});
    return activePage;
}

function addPageControlEventListeners(type) {
    let pageControls = document.getElementById('inventory_pagecontrols');
    if (pageControls !== null) {
        pageControls.addEventListener('click', () => {
            setTimeout(() => {
                if (type === 'inventory') addFloatIndicatorsToPage(getActivePage('inventory'));
                else if (type === 'offer') addFloatIndicatorsToPage('page');
            }, 500);
        })
    }
    else setTimeout(() => {addPageControlEventListeners()}, 1000);
}

function trimFloatCache() {
    chrome.storage.local.get(null, (result) => { // gets all storage
        for (let storageKey in result) {
            if (storageKey.substring(0, 11) === 'floatCache_') {
                let timeSinceLastUsed = (Date.now() - result[storageKey].lastUsed) / 1000; // in seconds
                let used = result[storageKey].used;

                // if unused and in cache for over a day, or used but not for over a week, then this whole thing negated because the ones that do not fit this wil remain in the cache
                if ((used === 0 && timeSinceLastUsed > 86400) || (used > 0 && timeSinceLastUsed > 604800)) {
                    chrome.storage.local.remove([storageKey], () => {});
                }
            }
        }
    });
}

function getFloatBarSkeleton(type) {
    let typeClass = type === 'market' ? 'Market' : '';
    return `<div class="floatBar${typeClass}">
    <div class="floatToolTip">
        <div>Float: <span class="floatDropTarget">Waiting for csgofloat.com</span></div>
        <svg class="floatPointer" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"></path></svg>
   </div>
     <div class="progress">
        <div class="progress-bar floatBarFN" title="${exteriors.factory_new.localized_name}"></div>
        <div class="progress-bar floatBarMW" title="${exteriors.minimal_wear.localized_name}"></div>
        <div class="progress-bar floatBarFT" title="${exteriors.field_tested.localized_name}"></div>
        <div class="progress-bar floatBarWW" title="${exteriors.well_worn.localized_name}"></div>
        <div class="progress-bar floatBarBS" title="${exteriors.battle_scarred.localized_name}"></div>
     </div>
     <div class="showTechnical">Show Technical</div>
     <div class="floatTechnical hidden"></div>
    </div>`
}

function getDataFilledFloatTechnical(floatInfo) {
    let floatRankLine = (floatInfo.low_rank !== undefined && floatInfo.low_rank !== null) ? `Low Rank: ${floatInfo.low_rank}<br>` : '';
    return `
            Technical:<br>
            Float Value: ${floatInfo.floatvalue}<br>
            Paint Index: ${floatInfo.paintindex}<br>
            Paint Seed: ${floatInfo.paintseed}<br>
            Origin: ${floatInfo.origin_name}<br>
            Best Possible Float: ${floatInfo.min}<br>
            Worst Possible Float: ${floatInfo.max}<br>
            ${floatRankLine}
            <br>
            Float info from <a href="https://csgofloat.com/" target="_blank">csgofloat.com</a>`;
}

let searchListenerTimeout = null;
function addSearchListener(type) {
    let searchElement;
    if (type === 'inventory') searchElement = document.getElementById('filter_control');
    else if (type === 'offer') searchElement = document.querySelector('.filter_search_box');

    if (searchElement !== null) {
        searchElement.addEventListener('input', () => {

            if (searchListenerTimeout !== null) clearTimeout(searchListenerTimeout);
            searchListenerTimeout = setTimeout(() => {
                if (type === 'inventory') addFloatIndicatorsToPage(getActivePage('inventory'));
                else if (type === 'offer') addFloatIndicatorsToPage('page');
                searchListenerTimeout = null;
            }, 1000);
        });
    }
    else setTimeout(() => {addSearchListener(type)}, 1000);
}

function trackEvent(event) {
    let analyticsInfo = {
        type: event.type,
        action: event.action,
        timestamp: Date.now()
    };

    chrome.storage.local.get('analyticsEvents', (result) => {
        result.analyticsEvents.push(analyticsInfo);
        chrome.storage.local.set({analyticsEvents: result.analyticsEvents}, () => {});
    });
}

function sendTelemetry(retries) {
    let settingsStorageKeys = [];
    let keysNotToGet = nonSettingStorageKeys;
    keysNotToGet.push('steamAPIKey', 'steamIDOfUser');

    for (let key in storageKeys) if (!keysNotToGet.includes(key)) settingsStorageKeys.push(key);

    let storageKeysForTelemetry = settingsStorageKeys;
    storageKeysForTelemetry.push('analyticsEvents', 'clientID');

    chrome.storage.local.get(storageKeysForTelemetry, (result) => {
        if (result.telemetryOn) {
            let eventsSummary = {
                events: {},
                pageviews: {}
            };

            result.analyticsEvents.forEach(event => {
                let date = new Date(event.timestamp).toISOString().split('T')[0];

                if (eventsSummary.events[date] === undefined && eventsSummary.pageviews[date] === undefined) {
                    eventsSummary.events[date] = {};
                    eventsSummary.pageviews[date] = {};
                }

                eventsSummary[`${event.type}s`][date][event.action] !== undefined ? eventsSummary[`${event.type}s`][date][event.action]++ : eventsSummary[`${event.type}s`][date][event.action] = 1;
            });

            let preferences = {};

            settingsStorageKeys.forEach(setting => {
                let customOrDefault = ['customCommentsToReport', 'popupLinks', 'reoccuringMessage', 'reputationMessage'];
                let toIgnore = ['analyticsEvents', 'clientID', 'exchangeRate'];

                if (customOrDefault.includes(setting)) preferences[setting] = JSON.stringify(result[setting]) === JSON.stringify(storageKeys[setting]) ? 'default' : 'custom';
                else if (toIgnore.includes(setting)) {}
                else preferences[setting] = result[setting]
            });

            chrome.runtime.getPlatformInfo((platformInfo) => {
                let os = platformInfo.os;

                let requestBody = {
                    browserLanguage: navigator.language,
                    clientID: result.clientID,
                    client_version: chrome.runtime.getManifest().version,
                    events: eventsSummary,
                    preferences: preferences,
                    os: os
                };

                let getRequest = new Request('https://api.csgotrader.app/analytics/putevents', {
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                });

                fetch(getRequest).then((response) => {
                    if (!response.ok) {
                        console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                    }
                    else return response.json();
                }).then((body) => {
                    if (body.body === undefined || body.body.success === 'false') {
                        if (retries < 5) setTimeout(() => {sendTelemetry(++retries)}, 600*5);
                        else {
                            let newAnalyticsEvents = result.analyticsEvents.filter(event => event.timestamp > (Date.now() - (1000*60*60*24*7)));
                            chrome.storage.local.set({analyticsEvents: newAnalyticsEvents}, () => {});
                        }
                    }
                    else if (body.body.success === 'true'){
                        chrome.storage.local.set({analyticsEvents: []}, () => {});
                    }
                }).catch((err) => {
                    console.log(err);
                });
            });
        }
        else chrome.storage.local.set({analyticsEvents: []}, () => {});
    });
}

function injectStyle(styleString, elementID) {
    let styleElement = document.createElement('style');
    styleElement.id = elementID;
    styleElement.innerHTML = styleString;
    document.querySelector('body').appendChild(styleElement);
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

// sends a message to the "back end" to request offers (history or active only with descriptions)
function getOffersFromAPI(type) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({getTradeOffers: type}, (response) => {
            if (response.apiKeyValid === false) reject('apiKeyInvalid');
            else {
                if (!(response.offers === undefined || response === 'error')) resolve(response.offers);
                else reject('steamError');
            }
        });
    });
}

function extractItemsFromOffers(offers) {
    let itemsToReturn = [];
    if (offers !== undefined || null) {
        offers.forEach(offer => {
            if (offer.items_to_give !== undefined) offer.items_to_give.forEach(item => {
                item.owner = getPoperStyleSteamIDFromOfferStyle(offer.accountid_other);
                itemsToReturn.push(item)
            });
            if (offer.items_to_receive !== undefined) offer.items_to_receive.forEach(item => {
                item.owner = getPoperStyleSteamIDFromOfferStyle(offer.accountid_other);
                itemsToReturn.push(item)
            });
        });
    }

    return itemsToReturn;
}

function logExtensionPresence() {
    let version = chrome.runtime.getManifest().version;
    console.log(`CSGO Trader - Steam Trading Enhancer ${version} is running on this page. Changelog at: https://csgotrader.app/changelog/`);
    console.log('If you see any errors that seem related to the extension please email support@csgotrader.app')
}

// tested and works in inventories, offers and market pages, does not work on profiles and incoming offers page
function getSteamWalletInfo() {
    let getWalletInfoScript = `document.querySelector('body').setAttribute('steamWallet', JSON.stringify(g_rgWalletInfo));`;
    return JSON.parse(injectToPage(getWalletInfoScript, true, 'steamWalletScript', 'steamWallet'));
}

function getSteamWalletCurrency() {
    let getCurrencyScript = `document.querySelector('body').setAttribute('steamWalletCurrency', GetCurrencyCode(${getSteamWalletInfo().wallet_currency}));`;
    return injectToPage(getCurrencyScript, true, 'steamWalletCurrencyScript', 'steamWalletCurrency');
}

function getPriceOverview(market_hash_name) {
    return new Promise((resolve, reject) => {
        let currencyID = getSteamWalletInfo().wallet_currency;
        let request = new Request(`https://steamcommunity.com/market/priceoverview/?appid=730&country=US&currency=${currencyID}&market_hash_name=${market_hash_name}`);

        fetch(request).then((response) => {
            if (!response.ok) {
                console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                reject({status:response.status, statusText: response.statusText});
            }
            return response.json();
        }).then((priceOverviewJSON) => {
            if (priceOverviewJSON === null) reject ('success:false');
            else if (priceOverviewJSON.success === true) resolve(priceOverviewJSON);
            else reject ('success:false');
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
}

// to convert the formatted price string that the price overview api call returns to cent int (for market listing)
function steamFormattedPriceToCents(formattedPrice) {
    let formattedToIntScript = `document.querySelector('body').setAttribute('formattedToInt', GetPriceValueAsInt('${formattedPrice}'));`;
    return injectToPage(formattedToIntScript, true, 'formattedToIntScript', 'formattedToInt');
}

// converts cent integers to pretty formatted string
function centsToSteamFormattedPrice(centsPrice) {
    let intToFormattedScript = `document.querySelector('body').setAttribute('intToFormatted', v_currencyformat(${centsPrice}, GetCurrencyCode(g_rgWalletInfo.wallet_currency)));`;
    return injectToPage(intToFormattedScript, true, 'intToFormattedScript', 'intToFormatted');
}

function userPriceToProperPrice(userInput) {
    let strippedFromExtraChars = userInput.replace(/[^0-9.,]/g, '');
    let splitChar =  strippedFromExtraChars.includes('.') ? '.' : strippedFromExtraChars.includes(',') ? ',' : '';
    if (splitChar === '') return parseInt(strippedFromExtraChars + '00'); // whole number

    let parts = strippedFromExtraChars.split(splitChar);
    let wholePart = parts[0];
    let decimalPart = parts[1] === undefined ? '00' : parts[1];

    if (decimalPart.length === 1) decimalPart += '0'; // turns 0.3 into 0.30
    else if (decimalPart.length > 2) decimalPart = decimalPart.substr(0, 2); // turns 0.0003 into 0.00
    return parseInt(wholePart + decimalPart);
}

function getPriceAfterFees(priceBeforeFees) {
    // TODO get the publisher fee dynamically
    let priceAfterFeesScript = `
        document.querySelector('body').setAttribute('priceAfterFees', ${priceBeforeFees} - CalculateFeeAmount( ${priceBeforeFees}, g_rgWalletInfo['wallet_publisher_fee_percent_default'] ).fees);`;
    return parseInt(injectToPage(priceAfterFeesScript, true, 'priceAfterFeesScript', 'priceAfterFees'));
}

function updateOfferHistoryData() {
    getOffersFromAPI('historical').then(
        offers => {
            chrome.storage.local.get('tradeHistoryLastUpdate', (result) => {
                let allOffers = offers.trade_offers_received.concat(offers.trade_offers_sent);
                let offerHistoryToAdd = {};

                allOffers.forEach(offer => {
                    if (offer.time_updated > result.tradeHistoryLastUpdate) {
                        let partnerID = getPoperStyleSteamIDFromOfferStyle(offer.accountid_other);
                        let offerSummary = {
                            timestamp: offer.time_updated,
                            partner: partnerID,
                            ours:  offer.is_our_offer
                        };

                        if (offerHistoryToAdd[partnerID] !== undefined) offerHistoryToAdd[partnerID].push(offerSummary);
                        else offerHistoryToAdd[partnerID] = [offerSummary];
                    }
                });

                for (let steamID in offerHistoryToAdd) {
                    let offersToAdd = offerHistoryToAdd[steamID];
                    let storageKey = `offerHistory_${steamID}`;

                    let received = 0;
                    let last_received = 0;
                    let sent = 0;
                    let last_sent = 0;

                    offersToAdd.forEach(offer => {
                        if (offer.ours) {
                            sent++;
                            last_sent = offer.timestamp > last_sent ? offer.timestamp : last_sent;
                        }
                        else {
                            received++;
                            last_received = offer.timestamp > last_received ? offer.timestamp : last_received;
                        }
                    });

                    chrome.storage.local.get(storageKey, (result) => {
                        let offerSummaryFromStorage = result[storageKey];

                        if (offerSummaryFromStorage === undefined) {
                            chrome.storage.local.set({
                                [storageKey]: {
                                    offers_received: received,
                                    offers_sent: sent,
                                    last_received: last_received,
                                    last_sent: last_sent
                                }
                            }, () => {});
                        }
                        else {
                            chrome.storage.local.set({
                                [storageKey]: {
                                    offers_received: offerSummaryFromStorage.offers_received + received,
                                    offers_sent: offerSummaryFromStorage.offers_sent + sent,
                                    last_received: last_received > offerSummaryFromStorage.last_received ? last_received : offerSummaryFromStorage.last_received,
                                    last_sent: last_sent > offerSummaryFromStorage.last_sent ? last_sent : offerSummaryFromStorage.last_sent
                                }
                            }, () => {});
                        }
                    });
                }
                chrome.storage.local.set({tradeHistoryLastUpdate: Math.floor(Date.now() / 1000)}, () => {});
            });

        }, (error) => {
            if (error === 'apiKeyInvalid') {
                console.log('API key invalid');
            }
        }
    );
}

function dateToISODisplay(unixTimestamp) {
    let unformatted = (new Date(unixTimestamp * 1000)).toISOString();
    let date = unformatted.split('T')[0];
    let time = unformatted.split('T')[1].substr(0, 5);
    return `${date} ${time}`
}

function prettyTimeAgo(unixTimestamp) {
    let differenceSeconds = (Date.now() - new Date(unixTimestamp * 1000)) / 1000;
    let prettyString = '';

    if (differenceSeconds < 60) prettyString = 'Just now';
    else if (differenceSeconds >= 60 && differenceSeconds < 120) prettyString = '1 minute ago';
    else if (differenceSeconds >= 120 && differenceSeconds < 3600) prettyString = `${Math.trunc(differenceSeconds / 60)} minutes ago`;
    else if (differenceSeconds >= 3600 && differenceSeconds < 7200) prettyString = '1 hour ago';
    else if (differenceSeconds >= 7200 && differenceSeconds < 86400) prettyString = `${Math.trunc(differenceSeconds / 3600)} hours ago`;
    else if (differenceSeconds >= 86400 && differenceSeconds < (86400 *2)) prettyString = '1 day ago';
    else if (differenceSeconds >= (86400 * 2) && differenceSeconds < (86400 * 7)) prettyString = `${Math.trunc(differenceSeconds / 86400)} days ago`;
    else if (differenceSeconds >= (86400 * 7) && differenceSeconds < (86400 * 14)) prettyString = '1 week ago';
    else if (differenceSeconds >= (86400 * 14) && differenceSeconds < (86400 * 30)) prettyString = `${Math.trunc(differenceSeconds / (86400 * 7))} weeks ago`;
    else if (differenceSeconds >= (86400 * 30) && differenceSeconds < (86400 * 60)) prettyString = 'Over a month ago';
    else if (differenceSeconds >= (86400 * 60) && differenceSeconds < (86400 * 365)) prettyString = `${Math.trunc(differenceSeconds / (86400 * 30))} months ago`;
    else prettyString = 'Over a year ago';

    return prettyString;
}

function getHighestBuyOrder(market_hash_name) {
    return new Promise((resolve, reject) => {
        let currencyID = getSteamWalletInfo().wallet_currency;
        chrome.runtime.sendMessage({getBuyOrderInfo: {
                currencyID: currencyID,
                market_hash_name: market_hash_name
            }}, (response) => {
            if (response.getBuyOrderInfo !== 'error') resolve(response.getBuyOrderInfo.highest_buy_order);
            else reject('error');
        });
    });
}

function scrapeSteamAPIkey() {
    let getRequest = new Request('https://steamcommunity.com/dev/apikey');

    fetch(getRequest).then((response) => {
        if (!response.ok) {
            console.log(`Error code: ${response.status} Status: ${response.statusText}`);
        }
        else return response.text();
    }).then((body) => {
        let html = document.createElement('html');
        html.innerHTML = body;
        let apiKey = null;
        try {apiKey =  html.querySelector('#bodyContents_ex').querySelector('p').innerText.split(': ')[1]}
        catch (e) {
            console.log(e);
            console.log(body);
        }
        console.log(apiKey);

        validateSteamAPIKey(apiKey).then(
            apiKeyValid => {
                if (apiKeyValid) {
                    console.log('api key valid');
                    chrome.storage.local.set({steamAPIKey: apiKey, apiKeyValid: true}, () => {});
                }
            }, (error) => {
                console.log(error);
            });
    }).catch(err => {
        console.log(err);
    });
}

function validateSteamAPIKey(apiKey) {
    return new Promise((resolve, reject) => {
        let getRequest = new Request(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=76561198036030455`);

        fetch(getRequest).then((response) => {
            if (!response.ok) {
                console.log(`Error code: ${response.status} Status: ${response.statusText}`);
                reject(response.status)
            }
            else return response.json();
        }).then((body) => {
            try {
                if (body.response.players[0].steamid === '76561198036030455') resolve(true);
                else resolve(false)
            }
            catch (e) {
                console.log(e);
                reject(e)
            }
        }).catch(err => {
            console.log(err);
            reject(err)
        });
    });
}