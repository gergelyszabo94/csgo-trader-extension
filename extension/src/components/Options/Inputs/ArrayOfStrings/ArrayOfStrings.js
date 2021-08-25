import React, { useState, useEffect } from 'react';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';

const ArrayOfStrings = ({
  id,
}) => {
  const [strings, setStrings] = useState([]);
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

  return (
    <div>
      {strings.map((string, index) => {
        return (
          <div key={string.trim()}>
            <span>{string}</span>
            <CustomA11yButton action={() => { removeString(index); }} title="Remove string">
              <FontAwesomeIcon icon={faTrash} className="delete" />
            </CustomA11yButton>
          </div>
        );
      })}
    </div>
  );
};

export default ArrayOfStrings;
