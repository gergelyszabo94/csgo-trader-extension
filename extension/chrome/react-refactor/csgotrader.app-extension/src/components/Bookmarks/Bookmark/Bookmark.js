import React from "react";
import Countdown from "./Countdown";
import NewTabLink from "components/NewTabLink/NewTabLink";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChartLine, faTrash, faUser, faLink, faBell, faComment } from "@fortawesome/free-solid-svg-icons";

const Bookmark = (props) => {
    console.log(props);
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
            {/*<div>*/}
            {/*    <input type='text' value={comment} onChange={onchangeHandler}/>*/}
            {/*</div>*/}
            <div className='actions'>
                <Action>
                    <NewTabLink to={itemInfo.inspectLink}>
                        <FontAwesomeIcon icon={faEye} />
                    </NewTabLink>
                </Action>
                <Action>
                    <NewTabLink to={itemInfo.marketlink}>
                        <FontAwesomeIcon icon={faChartLine} />
                    </NewTabLink>
                </Action>
                <Action>
                    <NewTabLink to={`https://steamcommunity.com/profiles/${owner}/inventory/#730_2_${itemInfo.assetid}`}>
                        <FontAwesomeIcon icon={faLink} />
                    </NewTabLink>
                </Action>
                <Action>
                    <NewTabLink to={`https://steamcommunity.com/profiles/${owner}`}>
                        <FontAwesomeIcon icon={faUser} />
                    </NewTabLink>
                </Action>
                <Action>
                    <FontAwesomeIcon icon={faComment} />
                </Action>
                <Action>
                    <FontAwesomeIcon icon={faBell} />
                </Action>
                <Action>
                    <FontAwesomeIcon icon={faTrash} />
                </Action>
                {/*{`${notifTime} ${nofitType} ${notify} ${owner}`}*/}
            </div>
            <div className='center'>
                <Tradability tradability={itemInfo.tradability}/>
            </div>
        </div>
    );
};

const Tradability = (props) => {
    const { tradability } = props;

    if (tradability === 'Tradable') {
        return (
            <div className='tradable'>
                {tradability}
            </div>
        );
    }
    else if (tradability !== 'Not Tradable') {
        return (
            <Countdown tradability={tradability}/>
        );
    }
    else {
        return (
            <div className='countdown'>
                Untradable
            </div>
        );
    }
};

const Action = (props) => {
  return (
      <span className='action'>
          {props.children}
      </span>
  )
};

export default Bookmark;
