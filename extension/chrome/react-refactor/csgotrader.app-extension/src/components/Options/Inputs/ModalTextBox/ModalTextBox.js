import React, { Fragment, useState, useEffect } from "react";
import CustomModal from "components/CustomModal/CustomModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const ModalTextBox = props => {
    const [state, setState] = useState({
        initialized: false,
        content: '',
        inputValid: true,
        validationError: ''
    });

    const onChangeHandler = (change) => {
        setState({...state, content: change.target.value});
    };

    const inputValidator = () => {
        return new Promise((resolve, reject) => {
            if (props.id === 'steamAPIKey') {
                if (state.content !== '') {
                    chrome.runtime.sendMessage({apikeytovalidate: state.content}, (response) => {
                        if (response.valid) {
                            chrome.storage.local.set({steamAPIKey: state.content, apiKeyValid: true}, () => {
                                setState({...state, inputValid: true, validationError: ''});
                                resolve(true);
                            });
                        } else {
                            setState({
                                ...state,
                                inputValid: false,
                                validationError: 'Could not validate your API key, it\'s either incorrect or Steam is down at the moment'
                            });
                            reject('Could not validate your API key, it\'s either incorrect or Steam is down at the moment')
                        }
                    });
                }
                else {
                    chrome.storage.local.set({steamAPIKey: 'Not Set', apiKeyValid: false}, () => {
                        reject('empty_input');
                    });
                }
            }
            else resolve(true);
        });
    };

    useEffect(() => {
        if (!state.initialized) {
            chrome.storage.local.get([props.id], (result) => {
                setState({...state, initialized: true, content: result[props.id]})
            });
        }
    });

    return (
        <Fragment>
            <p>{state.content.substring(0,8) + '...'}</p>
            <CustomModal modalTitle={props.modalTitle} validator={inputValidator}>
                <input
                    className="custom-modal__input"
                    type="text"
                    placeholder="Type your text here"
                    value={state.content}
                    onChange={onChangeHandler}
                />
                <div className={`warning ${state.inputValid ? 'hidden' : null }`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span className="warning"> {state.validationError}</span>
                </div>
            </CustomModal>
        </Fragment>
    );
};

export default ModalTextBox;
