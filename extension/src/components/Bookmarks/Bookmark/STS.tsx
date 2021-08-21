import React from 'react';

export interface STSProps {
    isStatrack: boolean;
    souvenir: boolean;
}

const STS = ({ isStatrack, souvenir }: STSProps) => {
    if (isStatrack) {
        return <span className='statTrak'>StatTrak™</span>;
    }
    if (souvenir) {
        return <span className='souvenir'>Souvenir</span>;
    }
    return null;
};

export default STS;
