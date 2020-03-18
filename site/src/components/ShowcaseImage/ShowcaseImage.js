import React from 'react';
import './ShowcaseImage.css';

const ShowcaseImage = ({ src, title }) => {
  return (
    <div className="center showcase">
      <img src={src}
           title={title}
           alt={title}
           className='showcaseImage'/>
    </div>
  );
};

export default ShowcaseImage;