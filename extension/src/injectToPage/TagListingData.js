// the new market design keeps listing data only in React props, which content scripts can't read
document.querySelectorAll('button[data-accent-color="green"]:not([data-instant-buy-listing])').forEach((button) => {
  const fiberKey = Object.keys(button).find((key) => key.startsWith('__reactFiber'));
  let fiber = fiberKey ? button[fiberKey] : null;
  while (fiber && !(fiber.memoizedProps && fiber.memoizedProps.listing && fiber.memoizedProps.listing.listingid)) {
    fiber = fiber.return;
  }

  // empty value marks buttons that are not part of a listing so they are not checked again
  if (!fiber) {
    button.setAttribute('data-instant-buy-listing', '');
    return;
  }

  const { listingid, unPrice, unFee, eCurrency } = fiber.memoizedProps.listing;
  button.setAttribute('data-instant-buy-listing', JSON.stringify({
    listingid,
    converted_price: unPrice,
    converted_fee: unFee,
    converted_currencyid: 2000 + eCurrency,
  }));
});

document.dispatchEvent(new CustomEvent('csgoTraderListingsTagged'));
document.currentScript?.remove();
