import { getItemByAssetID, getAssetIDOfElement } from 'js/utils/utilsModular';

const doTheSorting = (items, itemElements, method, pages, type) => {
    if (method === "price_asc") {
        itemElements = itemElements.sort((a, b) => {
            const priceOfA = getItemByAssetID(items, getAssetIDOfElement(a)).price !== undefined ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(a)).price.price) : 0.0;
            const priceOfB = getItemByAssetID(items, getAssetIDOfElement(b)).price !== undefined ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(b)).price.price) : 0.0;
            return priceOfA - priceOfB;
        });
    }
    else if (method === "price_desc") {
        itemElements = itemElements.sort((a, b) => {
            const priceOfA = getItemByAssetID(items, getAssetIDOfElement(a)).price !== undefined ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(a)).price.price) : 0.0;
            const priceOfB = getItemByAssetID(items, getAssetIDOfElement(b)).price !== undefined ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(b)).price.price) : 0.0;
            return priceOfB - priceOfA;
        });
    }
    else if (method === "name_asc") {
        itemElements = itemElements.sort((a, b) => {
            const nameOfA = getItemByAssetID(items, getAssetIDOfElement(a)).market_hash_name.toLowerCase();
            const nameOfB = getItemByAssetID(items, getAssetIDOfElement(b)).market_hash_name.toLowerCase();
            if (nameOfA < nameOfB) return -1;
            if (nameOfA > nameOfB) return 1;
            return 0;
        });
    }
    else if (method === "name_desc") {
        itemElements = itemElements.sort((a, b) => {
            const nameOfA = getItemByAssetID(items, getAssetIDOfElement(a)).market_hash_name.toLowerCase();
            const nameOfB = getItemByAssetID(items, getAssetIDOfElement(b)).market_hash_name.toLowerCase();
            if (nameOfA > nameOfB) return -1;
            if (nameOfA < nameOfB) return 1;
            return 0;
        });
    }
    else if (method === "tradability_asc") {
        itemElements = itemElements.sort((a, b) => {
            const tradabilityOfA = getItemByAssetID(items, getAssetIDOfElement(a)).tradability;
            const tradabilityOfB = getItemByAssetID(items, getAssetIDOfElement(b)).tradability;
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
            const tradabilityOfA = getItemByAssetID(items, getAssetIDOfElement(a)).tradability;
            const tradabilityOfB = getItemByAssetID(items, getAssetIDOfElement(b)).tradability;
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
            const floatInfoOfA = getItemByAssetID(items, getAssetIDOfElement(a)).floatInfo;
            const floatInfoOfB = getItemByAssetID(items, getAssetIDOfElement(b)).floatInfo;

            if (floatInfoOfA === null && floatInfoOfB !== null) return 1;
            else if (floatInfoOfA !== null && floatInfoOfB === null) return -1;
            else if (floatInfoOfA === null && floatInfoOfB === null) return 0;

            const floatOfA = parseFloat(floatInfoOfA.floatvalue);
            const floatOfB = parseFloat(floatInfoOfB.floatvalue);

            if (floatOfA > floatOfB) return 1;
            if (floatOfA < floatOfB) return -1;
            return 0;
        });
    }
    else if (method === "float_desc") {
        itemElements = itemElements.sort((a, b) => {
            const floatInfoOfA = getItemByAssetID(items, getAssetIDOfElement(a)).floatInfo;
            const floatInfoOfB = getItemByAssetID(items, getAssetIDOfElement(b)).floatInfo;

            if (floatInfoOfA === null && floatInfoOfB !== null) return 1;
            else if (floatInfoOfA !== null && floatInfoOfB === null) return -1;
            else if (floatInfoOfA === null && floatInfoOfB === null) return 0;

            const floatOfA = parseFloat(floatInfoOfA.floatvalue);
            const floatOfB = parseFloat(floatInfoOfB.floatvalue);

            if (floatOfA > floatOfB) return -1;
            if (floatOfA < floatOfB) return 1;
            return 0;
        });
    }
    else if (method === "default") {
        itemElements = itemElements.sort((a, b) => {
            const positionOfA = parseInt(getItemByAssetID(items, getAssetIDOfElement(a)).position);
            const positionOfB = parseInt(getItemByAssetID(items, getAssetIDOfElement(b)).position);

            if (positionOfA > positionOfB) return 1;
            if (positionOfA < positionOfB) return -1;
            return 0;
        });
    }
    else if (method === "reverse") {
        itemElements = itemElements.sort((a, b) => {
            const positionOfA = parseInt(getItemByAssetID(items, getAssetIDOfElement(a)).position);
            const positionOfB = parseInt(getItemByAssetID(items, getAssetIDOfElement(b)).position);

            if (positionOfA > positionOfB) return -1;
            if (positionOfA < positionOfB) return 1;
            return 0;
        });
    }
    else  if (method === "sticker_price_asc") {
        itemElements = itemElements.sort((a, b) => {
            const stickerPriceOfA = getItemByAssetID(items, getAssetIDOfElement(a)).stickerPrice !== null ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(a)).stickerPrice.price) : 0.0;
            const stickerPriceOfB = getItemByAssetID(items, getAssetIDOfElement(b)).stickerPrice !== null ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(b)).stickerPrice.price) : 0.0;
            return stickerPriceOfA - stickerPriceOfB;
        });
    }
    else if (method === "sticker_price_desc") {
        itemElements = itemElements.sort((a, b) => {
            const stickerPriceOfA = getItemByAssetID(items, getAssetIDOfElement(a)).stickerPrice !== null ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(a)).stickerPrice.price) : 0.0;
            const stickerPriceOfB = getItemByAssetID(items, getAssetIDOfElement(b)).stickerPrice !== null ?  parseFloat(getItemByAssetID(items, getAssetIDOfElement(b)).stickerPrice.price) : 0.0;
            return stickerPriceOfB - stickerPriceOfA;
        });
    }

    if (type === 'offer' || type === 'inventory') {
        itemElements.reverse();

        const numberOfItemsPerPage = type === 'offer' ? 16 : 25;

        pages.forEach((page) => {
            page.innerHTML = '';

            for ( let i = 0; i < numberOfItemsPerPage ; i++) {
                const item = itemElements.pop();

                if (item !== undefined) page.appendChild(item.parentElement);
                else {
                    const emptySlot = document.createElement('div');
                    emptySlot.classList.add('itemHolder', 'disabled');
                    page.appendChild(emptySlot);
                }
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
};

export { doTheSorting }