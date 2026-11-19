const marketData = Object.values(window.SSR?.loaderData || {})
  .map((value) => JSON.parse(value))
  .find((value) => value && Array.isArray(value.buckets) && value.listingQuery);

document.body.setAttribute('data-csgo-trader-market-buckets', JSON.stringify(marketData?.buckets || []));
document.dispatchEvent(new CustomEvent('csgoTraderMarketBucketsLoaded'));
document.currentScript?.remove();
