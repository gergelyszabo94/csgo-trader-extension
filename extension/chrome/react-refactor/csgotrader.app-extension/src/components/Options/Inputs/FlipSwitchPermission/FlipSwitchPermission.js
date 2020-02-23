import React, { useState, useEffect } from "react";
import FlipSwitch from "components/FlipSwitch/FlipSwitch";

const FlipSwitchPermission = props => {
  const [state, setState] = useState(false);

  useEffect(() => {
    if (props.origins) {
      chrome.storage.local.get([props.id], storageResult => {
        chrome.permissions.contains(
          { permissions: ["tabs"], origins: props.origins },
          permissionResult => {
            setState(storageResult[props.id] && permissionResult);
          }
        );
      });
    } else {
      chrome.permissions.contains(
        { permissions: [props.permission] },
        result => {
          setState(result);
        }
      );
    }
  }, [props.permission, props.origins, props.id]);

  const onChangeHandler = () => {
    if (!state) {
      if (props.origins) {
        chrome.permissions.request(
          { permissions: ["tabs"], origins: props.origins },
          granted => {
            chrome.storage.local.set({ [props.id]: granted }, () => {
              setState(granted);
            });
          }
        );
      } else {
        chrome.permissions.request({ permissions: ["tabs"] }, granted => {
          setState(granted);
        });
      }
    } else {
      if (props.origins) {
        chrome.storage.local.set({ [props.id]: false }, () => {
          setState(false);
        });
      } else {
        chrome.permissions.remove({ permissions: ["tabs"] }, removed => {
          setState(!removed);
        });
      }
    }
  };

  return <FlipSwitch id={props.id} checked={state} onChange={onChangeHandler}/>
};

export default FlipSwitchPermission;
