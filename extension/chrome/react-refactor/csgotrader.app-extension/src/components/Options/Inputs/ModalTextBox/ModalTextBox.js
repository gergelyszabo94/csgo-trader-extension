import React, { Fragment } from "react";
import CustomModal from "components/CustomModal/CustomModal";

const ModalTextBox = props => {
  // todo
  // getDataFromStorage
  // useEffect
  // setStorageData
  return (
    <Fragment>
      <p>not set yet</p>
      <CustomModal modalTitle={props.modalTitle}>
        <input
          class="custom-modal__input"
          type="text"
          placeholder="Type your text here"
        />
      </CustomModal>
    </Fragment>
  );
};

export default ModalTextBox;
