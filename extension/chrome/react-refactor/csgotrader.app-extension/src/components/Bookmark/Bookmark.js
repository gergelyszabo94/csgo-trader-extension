import React from "react";

const Bookmark = (props) => {
    const { comment, itemInfo, notifTime, nofitType, notify, owner } = props.bookmarkData;
    const imageSRC = `https://steamcommunity.com/economy/image/${itemInfo.iconURL}/256x256`;
    const exterior = itemInfo.exterior ?  itemInfo.exterior.localized_name : '';

    return (
        <div className='buildingBlock'>
            <h3>{itemInfo.name}</h3>
            <h4>{exterior}</h4>
            <img src={imageSRC} alt={itemInfo.name}/>
            <div>
                <input type='text' value={comment}/>
            </div>
            <div>
                {`${notifTime} ${nofitType} ${notify} ${owner}`}
            </div>
        </div>
    );
};

export default Bookmark;
