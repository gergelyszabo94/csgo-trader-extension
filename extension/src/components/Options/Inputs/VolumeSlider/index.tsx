import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';

const VolumeSlider = ({ id }) => {
    const [volume, setVolume] = useState(50);

    const onChangeHandler = (value) => {
        chrome.storage.local.set({ [id]: value }, () => {
            setVolume(value);
        });
    };

    useEffect(() => {
        chrome.storage.local.get(id, (result) => {
            setVolume(result[id]);
        });
    }, [id]);

    return (
        <ReactSlider
            className='notSlider'
            thumbClassName='sliderThumb'
            trackClassName='sliderTrack'
            thumbActiveClassName='sliderActiveThumb'
            onAfterChange={onChangeHandler}
            value={volume}
            withTracks
            renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        />
    );
};

export default VolumeSlider;
