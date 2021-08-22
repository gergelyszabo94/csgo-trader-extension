import React, { useEffect, useState } from 'react';

import CustomA11yButton from 'components/CustomA11yButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import defaultPopupLinks from 'utils/static/defaultPopupLinks';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface LinksToShowProps {
    id: string;
}

const LinksToShow = ({ id }: LinksToShowProps) => {
    const [links, setLinks] = useState([]);
    const [customLink, setCustomLink] = useState({
        name: '',
        url: '',
    });

    const defaultPopupLinkIDs = defaultPopupLinks.map((link) => {
        return link.id;
    });

    const nameInputHandler = (event) => {
        setCustomLink({
            ...customLink,
            name: event.target.value,
        });
    };
    const urlInputHandler = (event) => {
        setCustomLink({
            ...customLink,
            url: event.target.value,
        });
    };

    const addCustomUrl = () => {
        let isAlreadyExist = false;
        links.map((link) => {
            if (link.id === customLink.name.replace(/\W/g, '').toLowerCase()) {
                isAlreadyExist = true;
            }
            return null;
        });

        if (!isAlreadyExist) {
            const changedLinks = [
                ...links,
                {
                    id: customLink.name.replace(/\W/g, '').toLowerCase(), // removes non-alphanumeric chars - https://stackoverflow.com/questions/9364400/remove-not-alphanumeric-characters-from-string-having-trouble-with-the-char
                    name: customLink.name,
                    url: customLink.url,
                    active: true,
                },
            ];

            chrome.storage.local.set({ [id]: changedLinks }, () => {
                setLinks(changedLinks);
            });
        }
    };

    const removeCustomUrl = (event) => {
        links.map((link, mapIndex) => {
            if (link.id === event.target.id) {
                const filtered = links.filter((value, filterIndex) => {
                    return mapIndex !== filterIndex;
                });

                chrome.storage.local.set({ [id]: filtered }, () => {
                    setLinks(filtered);
                });
            }
            return null;
        });
    };

    const onChangeHandler = (event) => {
        const targetID = event.target.id;
        const changedLinks = [...links];
        changedLinks[targetID] = {
            ...changedLinks[targetID],
            active: !changedLinks[targetID].active,
        };
        chrome.storage.local.set({ [id]: changedLinks }, () => {
            setLinks(changedLinks);
        });
    };

    useEffect(() => {
        chrome.storage.local.get(id, (result) => {
            setLinks(result.popupLinks);
        });
    }, [id]);

    return (
        <>
            {links.map((link, index) => {
                return link.id === 'options' ? null : (
                    <div key={link.id} className='row mb-2'>
                        <div className='col-md-2 justify-content-start'>
                            <label className='switch'>
                                <input
                                    type='checkbox'
                                    id={index}
                                    checked={link.active}
                                    onChange={onChangeHandler}
                                />
                                <span className='slider round' />
                            </label>
                        </div>
                        <div className='col-md-3 justify-content-end pb-3'>{link.name}</div>
                        {!defaultPopupLinkIDs.includes(link.id) ? (
                            <div className='col-md-1'>
                                <CustomA11yButton
                                    id={link.id}
                                    action={removeCustomUrl}
                                    title='Delete'
                                >
                                    <FontAwesomeIcon
                                        id={link.id}
                                        icon={faTrash}
                                        className='apiIcon'
                                    />
                                </CustomA11yButton>
                            </div>
                        ) : null}
                    </div>
                );
            })}
            <hr />
            <label className='d-block'>
                <input
                    type='text'
                    className='input'
                    id='name'
                    value={customLink.name}
                    onChange={nameInputHandler}
                    placeholder='Name on popup'
                />
            </label>
            <label className='d-block'>
                <input
                    type='text'
                    className='input'
                    id='url'
                    value={customLink.url}
                    onChange={urlInputHandler}
                    placeholder='URL to point to'
                />
            </label>
            <button className='button button__save' onClick={addCustomUrl} type='submit'>
                Add new URL
            </button>
        </>
    );
};

export default LinksToShow;
