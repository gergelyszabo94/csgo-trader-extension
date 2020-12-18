const sortingModes = {
  default: {
    key: 'default',
    name: 'Default (position last to first)',
  },
  reverse: {
    key: 'reverse',
    name: 'Reverse (position first to last)',
  },
  price_desc: {
    key: 'price_desc',
    name: 'Price (expensive to cheap)',
  },
  price_asc: {
    key: 'price_asc',
    name: 'Price (cheap to expensive)',
  },
  name_asc: {
    key: 'name_asc',
    name: 'Alphabetical (a to z)',
  },
  name_desc: {
    key: 'name_desc',
    name: 'Alphabetical (z to a)',
  },
  tradability_desc: {
    key: 'tradability_desc',
    name: 'Tradability (untradable to tradable)',
  },
  tradability_asc: {
    key: 'tradability_asc',
    name: 'Tradability (tradable to untradable)',
  },
  float_asc: {
    key: 'float_asc',
    name: 'Float (lowest to highest)',
  },
  float_desc: {
    key: 'float_desc',
    name: 'Float (highest to lowest)',
  },
  sticker_price_asc: {
    key: 'sticker_price_asc',
    name: 'Sticker price (cheap to expensive)',
  },
  sticker_price_desc: {
    key: 'sticker_price_desc',
    name: 'Sticker price (expensive to cheap)',
  },
};

const offersSortingModes = {
  default: {
    key: 'default',
    name: 'Default (received last to first)',
  },
  reverse: {
    key: 'reverse',
    name: 'Reverse (received first to last)',
  },
  profit_amount: {
    key: 'profit_amount',
    name: 'Profit amount (most profitable to biggest loss)',
  },
  loss_amount: {
    key: 'loss_amount',
    name: 'Loss amount (biggest loss to most profitable)',
  },
  profit_percentage: {
    key: 'profit_percentage',
    name: 'Profit percentage (highest to lowest)',
  },
  loss_percentage: {
    key: 'loss_percentage',
    name: 'Loss percentage (lowest to highest)',
  },
  receiving_value: {
    key: 'receiving_value',
    name: 'Receiving side total value',
  },
  giving_value: {
    key: 'giving_value',
    name: 'Giving side total value',
  },
};

const listingsSortingModes = {
  default: {
    key: 'default',
    name: 'Default Steam Order',
  },
  price_asc: sortingModes.price_asc,
  price_desc: sortingModes.price_desc,
  float_asc: sortingModes.float_asc,
  float_desc: sortingModes.float_desc,
  sticker_price_asc: sortingModes.sticker_price_asc,
  sticker_price_desc: sortingModes.sticker_price_desc,
  paint_index_asc: {
    key: 'paint_index_asc',
    name: 'Paint index (low to high)',
  },
  paint_index_desc: {
    key: 'paint_index_desc',
    name: 'Paint index (high to low)',
  },
  paint_seed_asc: {
    key: 'paint_seed_asc',
    name: 'Paint seed (low to high)',
  },
  paint_seed_desc: {
    key: 'paint_seed_desc',
    name: 'Paint seed (high to low)',
  },
};

export { sortingModes, offersSortingModes, listingsSortingModes };
