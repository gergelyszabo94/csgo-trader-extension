import React, { useState } from 'react';

const Restore = () => {
    const [state, setState] = useState('hidden');

    const onChangeHandler = (change: React.ChangeEvent<HTMLInputElement>) => {
        const file = change.target.files[0];
        const fr = new FileReader();

        fr.addEventListener('load', (event) => {
            const inputAsJSON = JSON.parse(event.target.result as string);

            chrome.storage.local.set(inputAsJSON.storage, () => {
                setState('');
            });
        });
        fr.readAsText(file);
    };

    return (
        <>
            <input
                type='file'
                id='restore'
                name='restore'
                accept='.json'
                onChange={onChangeHandler}
            />
            <div className={state}>Restore completed!</div>
        </>
    );
};

export default Restore;
