import React from 'react'
import ChangelogInstance from '../ChangelogInstance';

const Three = () => {
  return (
    <ChangelogInstance version="3.0.0" date="2023-12-02" releaseNotes={true}>
      <li>
        Inspect skins in CS2 servers via <a href="https://www.cs2inspects.com/">CS2 Inspects</a>
      </li>
      <li>
        Migrated to Manifest V3
      </li>
      <li>
        In-Browser inspecting (screenshots) via <a href="https://swap.gg/screenshot">Swap.gg</a>
      </li>
      <li>
        Sticker enhancement is now optional on market listings.
      </li>
      <li>
        New default options for fresh installs to minimize the risk of Steam limiting requests due to excessive activity.
      </li>
      <li>
        Added "Safe instant and quick sell" option
      </li>
      <li>
        Fixed Doppler gem icons
      </li>
      <li>
      Renamed CS:GO to CS2 in some instances
      </li>
      <li>
      Removed Steam forum post bumping, as it likely causes community bans
      </li>
      <li>
        Fixed market multi-sell links on items with Unicode characters
      </li>
      <li>
        Fixed float values loading in inventories even when the feature is disabled
      </li>
      <li>
        Fixed WebChat message presets
      </li>
      <li>
        Removed Bitskins p2p links since it has shut down
      </li>
      <li>
        Updated dependencies
      </li>
    </ChangelogInstance>
  );
}

export default Three;