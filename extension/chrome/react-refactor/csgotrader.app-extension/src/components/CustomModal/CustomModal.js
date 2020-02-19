import React, { Fragment, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

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
        <div className={`overlay ${modalState}`}>
          {/* Active class to show */}
          <div className="custom-modal">
            <div className="custom-modal__close" onClick={closeModal} />
            <h5 className="custom-modal__title">{props.modalTitle}</h5>
            <div className="custom-modal__body">{props.children}</div>
            <div className="custom-modal__controls">
              <button className="button button__save" onClick={() => {props.validator(closeModal)}}>
                Save Changes
              </button>
              <button className="button button__cancel" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
        <span onClick={openModal} className='openModal'>
          <FontAwesomeIcon icon={faEdit} />
        </span>
      </Fragment>
  );
};

export default CustomModal;