import React from 'react';

import Row from 'components/Options/Row';
import Category from '../Category/Category';

const backupRestore = () => {
  return (
    <Category title="Data backup and restore">
      <Row
        name="Backup Data"
        id="backup_data"
        type="backup"
        description="Backup your extension settings/preferences, bookmarks, trade history information, etc, to a .json file that you can save and import on a different computer/browser or here later"
      />
      <Row
        name="Restore data from backup"
        id="restore"
        type="restore"
        description="Restore your extension data from a backup, you are looking for a .json file that was named csgotrader_data_backup.json when you backed it up.
                    Make sure you understand that all your current data will be replaced with data from the backup and lost forever."
      />
    </Category>
  );
};

export default backupRestore;
