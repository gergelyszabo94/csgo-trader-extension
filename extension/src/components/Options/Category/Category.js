import React, { useEffect } from 'react';

const Category = ({
  title, subTitle, children,
}) => {
  useEffect(() => {
    document.title = `Options - ${title}`;
  }, [title]);

  return (
    <div className="category">
      <div className="container">
        <div className="row">
          <div className="col-md-12 mx-0 px-0 mb-4">
            <h1>{title}</h1>
            {subTitle ? <p className="ml-3">{subTitle}</p> : null}
          </div>
        </div>
      </div>
      <div className="container">{children}</div>
    </div>
  );
};

export default Category;
