import React from 'react';
import ReleaseNote from '../ReleaseNote'

const TwoDotSix = () => {
  return  (
    <ReleaseNote
      version="2.6"
      title="Market improvements and other games compatibility"
      video="https://www.youtube.com/embed/6RMj4sj1fj0"
    >
      <p>
       Since there were lots of small additions that don't come through too well via screenshots Release Notes are only available in video format this time.
      </p>

      <div className="text-danger">
        There was a problem identified with this update that made market listings disappear.
        A fix of was issued, if the update applying the fix is not there for you yet you can work around it by going to the options
        and under market you change the default sorting mode to something other than the default and change it back. This completely fixes the issue.
      </div>
    </ReleaseNote>
  );
};

export default TwoDotSix;