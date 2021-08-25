import './Row.css';

import React from 'react';

export interface Option {
    key: string | number;
    text: string | number;
    description?: string;
}

interface RowProps {
    name: string;
    description: string | JSX.Element;
    children: React.ReactNode;
}

const row = ({ name, description, children }: RowProps) => {
    return (
        <div className='row mb-4 pb-4 option-row'>
            <div className='col-md-12'>
                <h5>{name}</h5>
            </div>
            <div className='col-md-6'>
                <p className='font-size--s'>{description}</p>
            </div>
            <div className='col-md-6'>
                {children}
            </div>
        </div>
    );
};

export default row;
