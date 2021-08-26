import React, { useEffect, useState } from 'react';

import CustomA11yButton from 'components/CustomA11yButton';
import Modal from 'components/Modal';

import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ModalCustomCommentsProps {
    modalTitle: string;
}

const ModalCustomComments = ({ modalTitle }: ModalCustomCommentsProps) => {
    const [state, setState] = useState({
        content: [],
        inputValue: '',
    });

    const onChangeHandler = (change) => {
        setState({ ...state, inputValue: change.target.value });
    };

    const deleteHandler = (index) => {
        const array = state.content;

        array.splice(index, 1);

        setState({
            ...state,
            content: array,
        });

        chrome.storage.local.set({ customCommentsToReport: state.content });
    };

    useEffect(() => {
        chrome.storage.local.get('customCommentsToReport', (result) => {
            setState({
                ...state,
                content: result.customCommentsToReport,
            });
        });
    }, []);

    const addNewString = () => {
        if (state.inputValue !== '') {
            const date = new Date();
            setState({
                content: [...state.content, { id: date.getTime(), text: state.inputValue }],
                inputValue: '',
            });

            chrome.storage.local.set({ customCommentsToReport: state.content });
        }
    };

    return (
        <>
            <Modal modalTitle={modalTitle} opener={<FontAwesomeIcon icon={faEdit} />} validator={addNewString}>
                {state.content.map((line, index) => {
                    return (
                        <div key={line.id}>
                            <span>{line.text}</span>
                            <CustomA11yButton
                                action={() => {
                                    deleteHandler(index);
                                }}
                                className='delete'
                                title='Delete'
                            >
                                Delete
                            </CustomA11yButton>
                        </div>
                    );
                })}
                <textarea
                    className='modalTextArea'
                    placeholder='Type your text here'
                    onChange={onChangeHandler}
                    value={state.inputValue}
                />
            </Modal>
        </>
    );
};

export default ModalCustomComments;
