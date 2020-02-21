/* global defaultPopupLinks*/
import React, { useState, useEffect, Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const LinksToShow = props => {
  const [links, setLinks] = useState([]);
  const [customLink, setCustomLink] = useState({
    name: "",
    url: ""
  });

  const defaultPopupLinkIDs = defaultPopupLinks.map(link => {
    return link.id;
  });

  const nameInputHandler = event => {
    setCustomLink({
      ...customLink,
      name: event.target.value
    });
  };
  const urlInputHandler = event => {
    setCustomLink({
      ...customLink,
      url: event.target.value
    });
  };

  const addCustomUrl = () => {
    let isAlreadyExist = false;
    links.map(link => {
      if (link.id === customLink.name.replace(/\W/g, "").toLowerCase()) {
        isAlreadyExist = true;
      }
      return null;
    });

    if (!isAlreadyExist) {
      const changedLinks = [
        ...links,
        {
          id: customLink.name.replace(/\W/g, "").toLowerCase(), // removes non-alphanumeric chars - https://stackoverflow.com/questions/9364400/remove-not-alphanumeric-characters-from-string-having-trouble-with-the-char
          name: customLink.name,
          url: customLink.url,
          active: true
        }
      ];

      chrome.storage.local.set({ [props.id]: changedLinks }, () => {
        setLinks(changedLinks);
      });
    }
  };

  const removeCustomUrl = event => {
    console.log(event.target.id);
    links.map((link, mapIndex) => {
      if (link.id === event.target.id) {
        var filtered = links.filter(function(value, filterIndex, arr) {
          return mapIndex !== filterIndex;
        });

        chrome.storage.local.set({ [props.id]: filtered }, () => {
          setLinks(filtered);
        });
      }
      return null;
    });
  };

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
          <div key={link.id} className="row mb-2">
            <div className="col-md-2 justify-content-start">
              <label className="switch">
                <input
                  type="checkbox"
                  id={index}
                  checked={link.active}
                  onChange={onChangeHandler}
                />
                <span className="slider round" />
              </label>
            </div>
            <div className="col-md-3 justify-content-end pb-3">{link.name}</div>

            {!defaultPopupLinkIDs.includes(link.id) ? (
              <div className="col-md-1">
                <span id={link.id} onClick={removeCustomUrl}>
                  <FontAwesomeIcon
                    id={link.id}
                    icon={faTrash}
                    className="apiIcon"
                  />
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
      <hr />
      <label className="d-block">
        <input
          type="text"
          className="input"
          id="name"
          value={customLink.name}
          onChange={nameInputHandler}
          placeholder="Name on popup"
        />
      </label>
      <label className="d-block">
        <input
          type="text"
          className="input"
          id="url"
          value={customLink.url}
          onChange={urlInputHandler}
          placeholder="URL to point to"
        />
      </label>
      <button className="button button__save" onClick={addCustomUrl}>
        Add new URL
      </button>
    </Fragment>
  );
};

export default LinksToShow;
