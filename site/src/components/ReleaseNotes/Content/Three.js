import React from 'react';
import ReleaseNote from '../ReleaseNote'

const Three = () => {
  return  (
    <ReleaseNote
      version="3.0"
      title="Manifest V3 migration"
    >
      <p>
        The major version bump might be a bit misleading since there were no significant new features added this time.
        Google Chrome is pushing developers to migrate to Manifest V3, which is a new version of the extension api.
        To comply with the new version's requirements, the extension had to be rewritten at quite a few places.
        Unfortunately, this means that the extension's latest version is no longer compatible
        with Firefox right now, since they themselves are not manifest V3 compliant.
        It's my fault, that I noticed that some api features I used are not (yet) available in Firefox too late.
        I will be leaving 2.16.4 available for Firefox users until Firefox catches up,
        but I won't be publishing any new versions for Firefox until V3 compliance on their part.
        Since I touched a lot of code, there might be some bugs that I missed, please report them if you find any.
      </p>
    </ReleaseNote>
  );
};

export default Three;