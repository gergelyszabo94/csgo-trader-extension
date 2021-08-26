import React, { useState, useEffect } from 'react';
import { faEdit, faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';
import Modal from 'components/Modal/Modal';

const ArrayOfStrings = ({ id, maxMessageLength }) => {
  const [strings, setStrings] = useState([]);
  const [modalText, setModalText] = useState('');
  const [inputValid, setInputValid] = useState(true);
  const [validationError, setValidationError] = useState('');

  const setStorage = (thisValue) => {
    chrome.storage.local.set({ [id]: thisValue }, () => {});
  };

  useEffect(() => {
    chrome.storage.local.get(id, (result) => {
      setStrings(result[id]);
    });
  }, [id]);

  const removeString = (indexToRemove) => {
    const newStrings = strings.filter((string, index) => {
      return index !== indexToRemove;
    });
    setStrings(newStrings);
    setStorage(newStrings);
  };

  const onChangeHandler = (change) => {
    setModalText(change.target.value);
  };

  const inputValidator = (closeModal) => {
    if (modalText.length <= maxMessageLength) {
      const newStrings = [...strings, modalText];
      setStrings(newStrings);
      setStorage(newStrings);
      setInputValid(true);
      setValidationError('');
      setModalText('');
      closeModal();
    } else {
      setInputValid(false);
      setValidationError(`Message can't be longer than ${maxMessageLength} characters!`);
    }
  };

  return (
    <div>
      {strings.map((string, index) => {
        return (
          <div key={string.trim()} className="mb-2">
            <span>{string}</span>
            <CustomA11yButton action={() => { removeString(index); }} title="Remove string">
              <FontAwesomeIcon icon={faTrash} className="delete" />
            </CustomA11yButton>
          </div>
        );
      })}
      <Modal
        modalTitle="Add your own message"
        opener={<FontAwesomeIcon icon={faEdit} />}
        validator={inputValidator}
      >
        <textarea
          className="modalTextArea"
          placeholder="Type your text here"
          onChange={onChangeHandler}
          value={modalText}
        />
        <div className={`warning ${inputValid ? 'hidden' : null}`}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span className="warning">
            {' '}
            {validationError}
          </span>
        </div>
      </Modal>
    </div>
  );
};

export default ArrayOfStrings;
