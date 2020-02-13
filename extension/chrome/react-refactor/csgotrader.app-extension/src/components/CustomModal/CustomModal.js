import React, { Fragment, useState } from "react";

const CustomModal = props => {
  const [modalState, setModalState] = useState("");

  const openModal = () => {
    setModalState("active");
  };

  const closeModal = () => {
    setModalState("");
  };
  return (
    <Fragment>
      <div className={"overlay " + modalState}>
        {/* Active class to show */}
        <div className="custom-modal">
          <div className="custom-modal__close" onClick={closeModal} />
          <h5 className="custom-modal__title">{props.modalTitle}</h5>
          <div className="custom-modal__body">{props.children}</div>
          <div className="custom-modal__controls">
            <button className="button button__save" onClick={closeModal}>
              Save
            </button>
            <button className="button button__cancel" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      <button onClick={openModal}>Ez lesz majd az open icon</button>
    </Fragment>
  );
};

export default CustomModal;
