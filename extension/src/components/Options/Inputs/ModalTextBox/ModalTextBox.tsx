import React, { useState, useEffect } from 'react';
import Modal from 'components/Modal/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ModalTextBox = ({ id, modalTitle }) => {
    const [state, setState] = useState({
        content: '',
        inputValid: true,
        validationError: '',
    });

    const onChangeHandler = (change) => {
        setState({ ...state, content: change.target.value });
    };

    const inputValidator = (closeModal) => {
        if (id === 'steamAPIKey') {
            if (state.content !== '') {
                chrome.runtime.sendMessage({ apikeytovalidate: state.content }, (response) => {
                    if (response.valid) {
                        chrome.storage.local.set(
                            { steamAPIKey: state.content, apiKeyValid: true },
                            () => {
                                setState({ ...state, inputValid: true, validationError: '' });
                                closeModal();
                            },
                        );
                    } else {
                        setState({
                            ...state,
                            inputValid: false,
                            validationError:
                                "Could not validate your API key, it's either incorrect or Steam is down at the moment",
                        });
                    }
                });
            } else {
                chrome.storage.local.set({ steamAPIKey: 'Not Set', apiKeyValid: false }, () => {
                    closeModal();
                });
            }
        } else {
            chrome.storage.local.set({ [id]: state.content }, () => {
                setState({ ...state, inputValid: true, validationError: '' });
                closeModal();
            });
        }
    };

    useEffect(() => {
        chrome.storage.local.get([id], (result) => {
            setState({ ...state, content: result[id] });
        });
    }, [id]);

    return (
        <>
            <p>{`${state.content.substring(0, 8)}...`}</p>
            <Modal
                modalTitle={modalTitle}
                opener={<FontAwesomeIcon icon={faEdit} />}
                validator={inputValidator}
            >
                <textarea
                    className='modalTextArea'
                    placeholder='Type your text here'
                    onChange={onChangeHandler}
                    value={state.content}
                />
                <div className={`warning ${state.inputValid ? 'hidden' : null}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span className='warning'> {state.validationError}</span>
                </div>
            </Modal>
        </>
    );
};

export default ModalTextBox;
