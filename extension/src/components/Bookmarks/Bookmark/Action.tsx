import React from 'react';

export interface ActionProps {
    className?: string;
    title?: string;
    children: React.ReactNode
}

const Action = ({ className, title, children }: ActionProps) => (
    <span className={`action ${className}`} title={title}>
        {children}
    </span>
);

export default Action;
