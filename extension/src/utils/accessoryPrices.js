const addAccessoryPricesToItemInfo = (itemInfo, item) => {
  if (!itemInfo) return false;
  if (!item) {
    itemInfo.querySelectorAll('.customAccessoryPrice, .customTotalAccessoryPrice')
      .forEach((priceElement) => priceElement.remove());
    return false;
  }

  const combinedAddons = [...(item.stickers || []), ...(item.charms || [])];
  const accessoryLinks = Array.from(itemInfo.querySelectorAll('a')).filter((link) => {
    if (link.classList.contains('customName')
      || link.classList.contains('inbrowserInspectLink')
      || link.classList.contains('inspectOnServer')
      || link.classList.contains('lowerModule')
      || link.closest('.upperModule, .lowerModule, .otherExteriors, .buffLink, .youpinLink, .floatDBLink, .pricEmpireLink, h1')) {
      return false;
    }
    return link.querySelector('img') !== null && link.querySelector('span') !== null;
  });

  const nameSpansWithPrices = new Set();
  accessoryLinks.forEach((accessoryLink, index) => {
    const nameSpan = accessoryLink.querySelector('span');
    if (nameSpan === null) return;
    nameSpansWithPrices.add(nameSpan);

    const existingPrice = nameSpan.querySelector('.customAccessoryPrice');
    const spanText = nameSpan.textContent
      .replace(existingPrice === null ? '' : existingPrice.textContent, '')
      .trim();
    let addon = combinedAddons[index];
    if (!addon || (!spanText.includes(addon.name) && !addon.fullName.includes(spanText))) {
      addon = combinedAddons.find((accessory) => {
        return spanText.includes(accessory.name) || accessory.fullName.includes(spanText);
      }) || addon;
    }

    const priceText = addon && addon.price && addon.price.display
      ? ` (${addon.price.display.trim()})`
      : '';
    if (priceText) {
      const priceElement = existingPrice || document.createElement('span');
      priceElement.classList.add('customAccessoryPrice');
      if (priceElement.textContent !== priceText) priceElement.textContent = priceText;
      if (existingPrice === null) nameSpan.appendChild(priceElement);
    } else if (existingPrice !== null) existingPrice.remove();
  });

  itemInfo.querySelectorAll('.customAccessoryPrice').forEach((priceElement) => {
    if (!nameSpansWithPrices.has(priceElement.parentElement)) priceElement.remove();
  });

  const parentContainer = accessoryLinks.length > 0 ? accessoryLinks[0].parentElement : null;
  const headerElement = parentContainer ? parentContainer.firstElementChild : null;
  const totalHeader = headerElement && headerElement !== accessoryLinks[0]
    ? headerElement
    : null;
  let totalElement = totalHeader
    ? totalHeader.querySelector('.customTotalAccessoryPrice')
    : null;

  itemInfo.querySelectorAll('.customTotalAccessoryPrice').forEach((existingTotal) => {
    if (existingTotal !== totalElement) existingTotal.remove();
  });

  const totalText = totalHeader && item.totalAddonPrice && item.totalAddonPrice.display
    ? ` (${item.totalAddonPrice.display})`
    : '';
  if (totalText) {
    if (totalElement === null) {
      totalElement = document.createElement('span');
      totalElement.classList.add('customTotalAccessoryPrice');
      totalHeader.appendChild(totalElement);
    }
    if (totalElement.textContent !== totalText) totalElement.textContent = totalText;
  } else if (totalElement !== null) totalElement.remove();

  return accessoryLinks.length > 0;
};

export default addAccessoryPricesToItemInfo;
