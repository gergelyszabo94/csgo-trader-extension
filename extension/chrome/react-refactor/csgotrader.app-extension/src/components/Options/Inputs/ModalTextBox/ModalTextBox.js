import React, { Fragment, useState, useEffect } from "react";
import Modal from "components/Modal/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEdit, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";

const ModalTextBox = props => {
  const [state, setState] = useState({
    content: "",
    inputValid: true,
    validationError: ""
  });

  const onChangeHandler = change => {
    setState({ ...state, content: change.target.value });
  };

  const inputValidator = closeModal => {
    if (props.id === "steamAPIKey") {
      if (state.content !== "") {
        chrome.runtime.sendMessage(
          { apikeytovalidate: state.content },
          response => {
            if (response.valid) {
              chrome.storage.local.set(
                { steamAPIKey: state.content, apiKeyValid: true },
                () => {
                  setState({ ...state, inputValid: true, validationError: "" });
                  closeModal();
                }
              );
            } else {
              setState({
                ...state,
                inputValid: false,
                validationError:
                  "Could not validate your API key, it's either incorrect or Steam is down at the moment"
              });
            }
          }
        );
      } else {
        chrome.storage.local.set(
          { steamAPIKey: "Not Set", apiKeyValid: false },
          () => {
            closeModal();
          }
        );
      }
    } else {
      chrome.storage.local.set({ [props.id]: state.content }, () => {
        setState({ ...state, inputValid: true, validationError: "" });
        closeModal();
      });
    }
  };

  useEffect(() => {
    chrome.storage.local.get([props.id], result => {
      setState({ ...state, content: result[props.id] });
    });
  }, [props.id]);

  return (
    <Fragment>
      <p>{state.content.substring(0, 8) + "..."}</p>
      <Modal modalTitle={props.modalTitle} opener={<FontAwesomeIcon icon={faEdit} />} validator={inputValidator}>
        <textarea
          className="modalTextArea"
          placeholder="Type your text here"
          value={state.content}
          onChange={onChangeHandler}
        />
        <div className={`warning ${state.inputValid ? "hidden" : null}`}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span className="warning"> {state.validationError}</span>
        </div>
      </Modal>
    </Fragment>
  );
};

export default ModalTextBox;
