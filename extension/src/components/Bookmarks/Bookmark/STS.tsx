import React from 'react';

export interface STSProps {
    stattrak: boolean;
    souvenir: boolean;
}

const STS = ({ stattrak, souvenir }: STSProps): JSX.Element | null => {
    if (stattrak) {
        return <span className='statTrak'>StatTrak™</span>;
    }
    if (souvenir) {
        return <span className='souvenir'>Souvenir</span>;
    }
    return null;
};

export default STS;
