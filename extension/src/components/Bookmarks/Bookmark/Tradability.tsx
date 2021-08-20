import React from 'react';
import Countdown from 'components/Bookmarks/Bookmark/Countdown';

const Tradability = (props) => {
    const { tradability } = props;

    if (tradability === 'Tradable') {
        return <span>{tradability}</span>;
    }
    if (tradability === 'Not Tradable') {
        return <div className='countdown'>Untradable</div>;
    }

    return <Countdown tradability={tradability} />;
};

export default Tradability;
