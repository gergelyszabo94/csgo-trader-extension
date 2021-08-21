import React from 'react';

export interface FlipSwitchProps {
    id: string;
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>
}

const FlipSwitch = ({ id, checked, onChange }: FlipSwitchProps) => {
    return (
        <div className='flipswitch'>
            <label className='switch'>
                <input type='checkbox' id={id} checked={checked} onChange={onChange} />
                <span className='slider round' />
            </label>
        </div>
    );
};

export default FlipSwitch;
