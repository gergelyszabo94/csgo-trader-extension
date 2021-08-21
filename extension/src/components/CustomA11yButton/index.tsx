import React from 'react';

export interface CustomA11yButtonProps {
    action: () => void;
    title?: string;
    className?: string;
    children?: React.ReactNode;
    id?: string;
}

const CustomA11yButton = ({ action, children, className, title, id }: CustomA11yButtonProps) => {
    return (
        <span
            role='button'
            tabIndex={0}
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
