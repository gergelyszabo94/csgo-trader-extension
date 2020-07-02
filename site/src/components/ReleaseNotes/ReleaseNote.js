import React from 'react';
import {Container} from 'react-bootstrap';
import ReleaseVideo from './ReleaseVideo'

const ReleaseNote = ({version, title, video, children}) => {
  const Video = () => {
    return video
      ? (
        <ReleaseVideo source={video} version={version} />
        )
      : null
  }

  return  (
    <Container className='buildingBlock' id={version}>
      <h2>{version} - {title}</h2>
      <Video />
      {children}
    </Container>
  );
};

export default ReleaseNote;