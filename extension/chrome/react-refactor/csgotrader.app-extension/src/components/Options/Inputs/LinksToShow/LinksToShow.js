import React, { useState, useEffect, Fragment } from "react";

const LinksToShow = props => {
  const [links, setLinks] = useState([]);

  const onChangeHandler = event => {
    const id = event.target.id;

    const changedLinks = [...links];
    const changedLink = {
      ...changedLinks[id],
      active: !changedLinks[id].active
    };
    changedLinks[id] = changedLink;

    chrome.storage.local.set({ [props.id]: changedLinks }, () => {
      setLinks(changedLinks);
    });
  };

  useEffect(() => {
    chrome.storage.local.get(props.id, result => {
      setLinks(result.popupLinks);
    });
  }, [props.id]);

  return (
    <Fragment>
      {links.map((link, index) => {
        return link.id === "options" ? null : (
          <div key={link.id}>
            <nobr>
              <span>{link.name}</span>&nbsp;&nbsp;&nbsp;&nbsp;
              <label className="switch">
                <input
                  type="checkbox"
                  id={index}
                  checked={link.active}
                  onChange={onChangeHandler}
                />
                <span className="slider round" />
              </label>
            </nobr>
          </div>
        );
      })}
    </Fragment>
  );
};

export default LinksToShow;
