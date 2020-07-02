import React from 'react';

const ReleaseVideo = ({source, version}) => {
  return  (
    <>
      <p>
        If you prefer the video format where I go into even more detail I have you covered:
      </p>
      <div className='video-container'>
        <iframe
          width='560'
          height='315'
          src={source}
          frameBorder='0'
          allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
          title={`CSGO Trader Updated ${version} Release Notes`}
          allowFullScreen>
        </iframe>
      </div>
      < br />
    </>
  );
};

export default ReleaseVideo;