const dateToISODisplay = (unixTimestamp) => {
  const unformatted = (new Date(unixTimestamp * 1000)).toISOString();
  const date = unformatted.split('T')[0];
  const time = unformatted.split('T')[1].substr(0, 5);
  return `${date} ${time}`;
};

const prettyTimeAgo = (unixTimestamp) => {
  const differenceSeconds = (Date.now() - new Date(unixTimestamp * 1000)) / 1000;
  let prettyString = '';

  if (differenceSeconds < 60) prettyString = 'Just now';
  else if (differenceSeconds >= 60 && differenceSeconds < 120) prettyString = '1 minute ago';
  else if (differenceSeconds >= 120 && differenceSeconds < 3600) prettyString = `${Math.trunc(differenceSeconds / 60)} minutes ago`;
  else if (differenceSeconds >= 3600 && differenceSeconds < 7200) prettyString = '1 hour ago';
  else if (differenceSeconds >= 7200 && differenceSeconds < 86400) prettyString = `${Math.trunc(differenceSeconds / 3600)} hours ago`;
  else if (differenceSeconds >= 86400 && differenceSeconds < (86400 * 2)) prettyString = '1 day ago';
  else if (differenceSeconds >= (86400 * 2) && differenceSeconds < (86400 * 7)) prettyString = `${Math.trunc(differenceSeconds / 86400)} days ago`;
  else if (differenceSeconds >= (86400 * 7) && differenceSeconds < (86400 * 14)) prettyString = '1 week ago';
  else if (differenceSeconds >= (86400 * 14) && differenceSeconds < (86400 * 30)) prettyString = `${Math.trunc(differenceSeconds / (86400 * 7))} weeks ago`;
  else if (differenceSeconds >= (86400 * 30) && differenceSeconds < (86400 * 60)) prettyString = 'Over a month ago';
  else if (differenceSeconds >= (86400 * 60) && differenceSeconds < (86400 * 365)) prettyString = `${Math.trunc(differenceSeconds / (86400 * 30))} months ago`;
  else prettyString = 'Over a year ago';

  return prettyString;
};

const tradeDateRegex = new RegExp([
  String.raw`(?:Tradable(?:/Marketable)? After|transferred until)\s*:?\s*(`,
  String.raw`\d{1,2}/\d{1,2}/\d{4},?\s+\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM)?`,
  '|',
  String.raw`[A-Za-z]{3,9}\s+\d{1,2},\s+\d{4},?\s*(?:\(?\d{1,2}:\d{2}:\d{2}\)?\s*(?:AM|PM)?\s*(?:GMT)?)?`,
  ')',
].join(''), 'i');

const getDescriptionValue = (description) => {
  if (typeof description === 'string') return description;
  if (description && description.value) return description.value;
  return '';
};

const getTradeDateFromDescription = (description) => {
  const text = getDescriptionValue(description)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/\d/.test(text)) return null;

  const tradeDateMatch = text.match(tradeDateRegex);
  if (!tradeDateMatch) return null;

  const tradeDate = tradeDateMatch[1].replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  if (Number.isNaN(new Date(tradeDate).getTime())) return null;

  return tradeDate;
};

const getTradeDateFromDescriptions = (descriptions) => {
  if (!descriptions) return null;

  for (const description of descriptions) {
    const tradeDate = getTradeDateFromDescription(description);
    if (tradeDate) return tradeDate;
  }

  return null;
};

const getShortDate = (tradabibilityDate) => {
  if (tradabibilityDate === 'Tradable' || tradabibilityDate === '') return 'T';
  if (!tradabibilityDate) return '';
  const now = new Date().getTime();
  const tradabilityTime = new Date(tradabibilityDate).getTime();
  if (Number.isNaN(tradabilityTime)) return '';
  const distance = tradabilityTime - now;
  if (distance <= 0) return 'T';

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  if (days === 0) {
    if (hours === 0) {
      if (minutes === 0) {
        if (seconds === 0) return '';
        return `${seconds}s`;
      }
      return `${minutes}m`;
    }
    return `${hours}h`;
  }
  return `${days}d`;
};

const getTradabilityInfo = (tradable, ownerDescriptions, descriptions) => {
  if (tradable !== 0) {
    return {
      tradability: 'Tradable',
      tradabilityShort: 'T',
    };
  }

  const tradeDate = getTradeDateFromDescriptions(ownerDescriptions)
    || getTradeDateFromDescriptions(descriptions);
  if (tradeDate) {
    return {
      tradability: tradeDate,
      tradabilityShort: getShortDate(tradeDate),
    };
  }

  return {
    tradability: 'Not Tradable',
    tradabilityShort: '',
  };
};

export {
  dateToISODisplay, prettyTimeAgo, getShortDate, getTradabilityInfo,
};
