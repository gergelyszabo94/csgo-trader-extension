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

const getShortDate = (tradabibilityDate) => {
  if (tradabibilityDate === 'Tradable' || tradabibilityDate === '') return 'T';
  const now = new Date().getTime();
  const distance = new Date(tradabibilityDate) - now;
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

export { dateToISODisplay, prettyTimeAgo, getShortDate };
