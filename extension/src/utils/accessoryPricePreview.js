import addAccessoryPricesToItemInfo from 'utils/accessoryPrices';

const itemPreviewSelector = '.inventory_iteminfo, #hover_content[data-featuretarget="iteminfo"]';
let hoveredItemID = null;
let hoveredItemElement = null;
const observedItemPreviews = new WeakSet();

const addAccessoryPricesToVisiblePreview = (itemInfo, getItemByID) => {
  const hoverContainer = itemInfo.closest('#hover, .economyitem_hover');
  const displayElement = hoverContainer === null ? itemInfo : hoverContainer;
  if (displayElement.style.display === 'none' || hoveredItemID === null) return;

  if (getItemByID) {
    const item = getItemByID(hoveredItemID);
    addAccessoryPricesToItemInfo(itemInfo, item);
  }
};

const getItemPreviews = (root) => {
  const previews = [...root.querySelectorAll(itemPreviewSelector)];
  if (root.nodeType === Node.ELEMENT_NODE && root.matches(itemPreviewSelector)) previews.push(root);
  return previews;
};

const getItemIDFromElement = (itemElement) => {
  if (itemElement === null) return null;
  const itemIDs = itemElement.id.split('_');
  return itemIDs.length === 3 && /^\d+$/.test(itemIDs[2]) ? itemIDs[2] : null;
};

const getItemElementFromTarget = (target) => {
  if (!(target instanceof Element)) return null;

  const itemElements = [
    target.closest('.trade_item'),
    target.closest('.item'),
  ].filter((itemElement) => itemElement !== null);

  return itemElements.find((itemElement) => getItemIDFromElement(itemElement) !== null)
    || itemElements[0]
    || null;
};

const initAccessoryPricePreview = (getItemByID = null) => {
  const observeItemPreview = (itemInfo) => {
    if (observedItemPreviews.has(itemInfo)) return;
    observedItemPreviews.add(itemInfo);

    const hoverContainer = itemInfo.closest('#hover, .economyitem_hover');
    const observerTarget = hoverContainer === null ? itemInfo : hoverContainer;
    const observer = new MutationObserver(() => {
      getItemPreviews(observerTarget).forEach((preview) => {
        addAccessoryPricesToVisiblePreview(preview, getItemByID);
      });
    });

    observer.observe(observerTarget, {
      attributes: true,
      attributeFilter: ['style'],
      childList: true,
      subtree: true,
    });

    addAccessoryPricesToVisiblePreview(itemInfo, getItemByID);
  };

  const refreshVisiblePreviews = () => {
    const currentItemID = getItemIDFromElement(hoveredItemElement);
    if (currentItemID !== null) hoveredItemID = currentItemID;

    getItemPreviews(document).forEach(observeItemPreview);
  };

  const previewDiscoveryObserver = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        if (node.matches(itemPreviewSelector)) observeItemPreview(node);
        node.querySelectorAll(itemPreviewSelector).forEach(observeItemPreview);
      });
    });
  });
  previewDiscoveryObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  document.addEventListener('mouseover', (event) => {
    const itemElement = getItemElementFromTarget(event.target);
    if (itemElement === null) return;

    const itemID = getItemIDFromElement(itemElement);
    if (itemElement === hoveredItemElement && itemID === hoveredItemID) return;

    hoveredItemElement = itemElement;
    hoveredItemID = itemID;
    requestAnimationFrame(refreshVisiblePreviews);
  }, true);

  refreshVisiblePreviews();
  return refreshVisiblePreviews;
};

export default initAccessoryPricePreview;
