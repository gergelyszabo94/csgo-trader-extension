import React, { useEffect } from 'react';

const Category = (props) => {
  useEffect(() => {
    document.title = `Options - ${props.title}`;
  }, [props.title]);

  return (
    <div className="category">
      <div className="container">
        <div className="row">
          <div className="col-md-12 mx-0 px-0 mb-4">
            <h1>{props.title}</h1>
            {props.subTitle ? <p className="ml-3">{props.subTitle}</p> : null}
          </div>
        </div>
      </div>
      <div className="container">{props.children}</div>
    </div>
  );
};

export default Category;
