import React from 'react';

import Category from '../Category';
import Backup from '../Inputs/Backup';
import Restore from '../Inputs/Restore';

import Row from 'components/Options/Row';

const backupRestore = () => {
    return (
        <Category title='Data backup and restore'>
            <Row
                name='Backup Data'
                description='Backup your extension settings/preferences, bookmarks, trade history information, etc, to a .json file that you can save and import on a different computer/browser or here later'
            >
                <Backup id='backup_data' />
            </Row>
            <Row
                name='Restore data from backup'
                description='Restore your extension data from a backup, you are looking for a .json file that was named csgotrader_data_backup.json when you backed it up.
                    Make sure you understand that all your current data will be replaced with data from the backup and lost forever.'
            >
                <Restore />
            </Row>
        </Category>
    );
};

export default backupRestore;
