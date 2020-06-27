// finds the item element on the page by the supplied IDs and page type
const findElementByIDs = (appID, contextID, assetID, type) => {
  const elementID = type.includes('offer')
    ? `item${appID}_${contextID}_${assetID}`
    : `${appID}_${contextID}_${assetID}`;
  return document.getElementById(elementID);
};

// find the item in the items array (containing all items)
// by the supplied ids
const getItemByIDs = (items, appID, contextID, assetID) => {
  if (items === undefined || items === null || items.length === 0) return null;
  return items.filter((item) => {
    return (item.assetid === assetID && item.appid === appID && item.contextid === contextID);
  })[0];
};

// gets the different item ids from the element id
const getIDsFromElement = (element, type) => {
  if (element === null || element === undefined || element.id.includes('anonymous_element')) return null;
  const IDs = element.id.split('_');
  return {
    appID: type === 'inventory' ? IDs[0] : IDs[0].split('item')[1],
    contextID: IDs[1],
    assetID: IDs[2],
  };
};

export { findElementByIDs, getItemByIDs, getIDsFromElement };
