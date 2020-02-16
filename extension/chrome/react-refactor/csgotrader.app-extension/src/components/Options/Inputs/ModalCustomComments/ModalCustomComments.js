import React, { Fragment, useState, useEffect } from "react";
import CustomModal from "components/CustomModal/CustomModal";

const ModalCustomComments = props => {
  const [state, setState] = useState({
    content: [],
    inputValue: ""
  });

  const onChangeHandler = change => {
    setState({ ...state, inputValue: change.target.value });
  };

  const deleteHandler = index => {
    let array = state.content;

    array.splice(index, 1);

    setState({
      ...state,
      content: array
    });

    chrome.storage.local.set({ customCommentsToReport: state.content });
  };

  useEffect(() => {
    chrome.storage.local.get("customCommentsToReport", result => {
      setState({
        ...state,
        content: result.customCommentsToReport
      });
    });
  }, []);

  const addNewString = () => {
    const date = new Date();
    let array = state.content;
    array.push({ id: date.getTime(), text: state.inputValue });
    setState({
      ...state,
      content: array,
      inputValue: ""
    });

    chrome.storage.local.set({ customCommentsToReport: state.content });
  };

  return (
    <Fragment>
      <CustomModal modalTitle={props.modalTitle} validator={addNewString}>
        {state.content.map((line, index) => {
          return (
            <div key={line.id}>
              <span>{line.text}</span>
              <span
                className="delete"
                onClick={() => {
                  deleteHandler(index);
                }}
              >
                Delete
              </span>
            </div>
          );
        })}
        <input
          className="custom-modal__input"
          type="text"
          placeholder="Type your text here"
          onChange={onChangeHandler}
          value={state.inputValue}
        />
      </CustomModal>
    </Fragment>
  );
};

export default ModalCustomComments;
