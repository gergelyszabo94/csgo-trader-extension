import React from 'react';

export interface NewTabLinkProps {
    to: string;
    children: React.ReactNode;
    className?: string;
}

const NewTabLink = ({ className, to, children }: NewTabLinkProps) => {
    return (
        <a href={to} target='_blank' rel='noopener' className={className}>
            {children}
        </a>
    );
};

export default NewTabLink;
