import React from 'react';
import {Container} from 'react-bootstrap';
import {Link} from 'react-router-dom';

const ChangelogInstance = ({version, date, subtitle, releaseNotes, disclaimer, children}) => {
  const ReleaseNotes = () => {
    return releaseNotes
      ? (
        <span>
        Check out the <Link to={`/release-notes/#${version}`}> Release Notes </Link> for more info on the new features.
        </span>
      )
      : '';
  };

  const Disclaimer = () => {
    return disclaimer
      ? (
        <div className="text-danger">
          {disclaimer}
        </div>
      )
      : '';
  };

  return  (
    <Container className='buildingBlock'>
      <h2>Version {version} - {date} {subtitle ? `(${subtitle})` : ''}</h2>
      <Disclaimer />
      <ReleaseNotes />
      <ul>
        {children}
      </ul>
    </Container>
  );
};

export default ChangelogInstance;