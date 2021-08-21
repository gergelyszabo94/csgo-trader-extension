import { Modal as BSModal, Button, ModalTitle } from 'react-bootstrap';
import React, { useState } from 'react';

import CustomA11yButton from 'components/CustomA11yButton';

export interface ModalProps {
    modalTitle: string;
    opener: JSX.Element;
    validator: ((closeModal: any) => void) | (() => void);
    children?: React.ReactNode;
}

const Modal = ({ modalTitle, opener, validator, children }: ModalProps) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <CustomA11yButton action={handleShow} className='openModal'>
                {opener}
            </CustomA11yButton>
            <BSModal show={show} onHide={handleClose}>
                <BSModal.Header closeButton>
                    <BSModal.Title>{modalTitle}</BSModal.Title>
                </BSModal.Header>
                <BSModal.Body>{children}</BSModal.Body>
                <BSModal.Footer>
                    <Button className='button button__cancel' onClick={handleClose}>
                        Close
                    </Button>
                    <Button
                        className='button button__save'
                        onClick={() => {
                            validator(handleClose);
                        }}
                    >
                        Save Changes
                    </Button>
                </BSModal.Footer>
            </BSModal>
        </>
    );
};

export default Modal;
