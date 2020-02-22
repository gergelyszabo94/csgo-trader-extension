import React from "react";

const Bookmark = (props) => {
    const { comment, itemInfo, notifTime, nofitType, notify, owner } = props.bookmarkData;
    const imageSRC = `https://steamcommunity.com/economy/image/${itemInfo.iconURL}/256x256`;
    const exterior = itemInfo.exterior ?  itemInfo.exterior.localized_name : '';
    const displayName = itemInfo.name.split('| ')[1];

    const onchangeHandler = () => {

    };

    return (
        <div className='bookmark col-xs-1'>
            <h5 className='itemName' title={itemInfo.name}>{displayName}</h5>
            <h6>{exterior}</h6>
            <img src={imageSRC} alt={itemInfo.name} title={itemInfo.name}/>
            <div>
                <input type='text' value={comment} onChange={onchangeHandler}/>
            </div>
            <div>
                {`${notifTime} ${nofitType} ${notify} ${owner}`}
            </div>
        </div>
    );
};

export default Bookmark;
