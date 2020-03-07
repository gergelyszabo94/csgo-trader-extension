import React, { useState, useEffect } from 'react';

const Backup = (props) => {
  const [href, setHref] = useState('');

  useEffect(() => {
    const storageKeysToExclude = ['prices', 'exchangeRates', 'analyticsEvents'];

    chrome.storage.local.get(null, (result) => { // gets all storage
      let JSONContent = 'data:application/json,';

      const backupJSON = {
        version: 2,
        type: 'full_backup',
        storage: {},
      };

      for (const storageKey in result) {
        if (!storageKeysToExclude.includes(storageKey) && storageKey.substring(0, 11) !== 'floatCache_') {
          backupJSON.storage[storageKey] = result[storageKey];
        }
      }

      JSONContent += encodeURIComponent(JSON.stringify(backupJSON));
      setHref(JSONContent);
    });
  }, []);


  return (
    <a
      href={href}
      download="csgotrader_data_backup.json"
      id={props.id}
    >
            Backup
    </a>
  );
};

export default Backup;
