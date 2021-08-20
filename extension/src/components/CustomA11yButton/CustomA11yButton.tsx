import React from 'react';

const CustomA11yButton = ({
  action, children, className, title, id,
}) => {
  return (
    <span
      role="button"
      tabIndex="0"
      onClick={action}
      onKeyDown={action}
      className={`${className} customButton`}
      title={title}
      id={id}
    >
      {children}
    </span>
  );
};

export default CustomA11yButton;
