import Countdown from 'components/Bookmarks/Bookmark/Countdown';
import React from 'react';

interface TradabilityProps {
    tradability: string;
}

const Tradability = ({ tradability }: TradabilityProps) => {
    if (tradability === 'Tradable') {
        return <span>{tradability}</span>;
    }
    if (tradability === 'Not Tradable') {
        return <div className='countdown'>Untradable</div>;
    }

    return <Countdown tradability={tradability} />;
};

export default Tradability;
