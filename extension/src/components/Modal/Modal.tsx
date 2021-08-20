import React, { useState } from 'react';
import { Button, Modal as BSModal } from 'react-bootstrap';
import CustomA11yButton from 'components/CustomA11yButton/CustomA11yButton';

const Modal = ({
  modalTitle, opener, validator, children,
}) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <CustomA11yButton action={handleShow} className="openModal">
        {opener}
      </CustomA11yButton>
      <BSModal show={show} onHide={handleClose}>
        <BSModal.Header closeButton>
          <BSModal.Title>{modalTitle}</BSModal.Title>
        </BSModal.Header>
        <BSModal.Body>
          {children}
        </BSModal.Body>
        <BSModal.Footer>
          <Button className="button button__cancel" onClick={handleClose}>
            Close
          </Button>
          <Button className="button button__save" onClick={() => { validator(handleClose); }}>
            Save Changes
          </Button>
        </BSModal.Footer>
      </BSModal>
    </>
  );
};

export default Modal;
