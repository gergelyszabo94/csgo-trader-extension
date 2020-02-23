import React, { useState } from "react";
import { Button, Modal as BSModal} from "react-bootstrap";

const Modal = (props) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
             <span onClick={handleShow} className='openModal'>
                {props.opener}
            </span>

            <BSModal show={show} onHide={handleClose}>
                <BSModal.Header closeButton>
                    <BSModal.Title>{props.modalTitle}</BSModal.Title>
                </BSModal.Header>
                <BSModal.Body>
                    {props.children}
                </BSModal.Body>
                <BSModal.Footer>
                    <Button className="button button__cancel" onClick={handleClose}>
                        Close
                    </Button>
                    <Button className="button button__save" onClick={() => {props.validator(handleClose)}}>
                        Save Changes
                    </Button>
                </BSModal.Footer>
            </BSModal>
        </>
    );

};

export default Modal;
