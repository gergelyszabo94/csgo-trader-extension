import React from 'react';

import Category from '../Category';
import FlipSwitchStorage from '../Inputs/FlipSwitchStorage';
import ModalTextBox from '../Inputs/ModalTextBox';

import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Row from 'components/Options/Row';

const profile = () => {
    return (
        <Category title='Profile'>
            <Row
                name='Show "+rep" button'
                description='Puts a "+rep" button on profiles which when pressed comments your reputation message'
            >
                <FlipSwitchStorage id='showPlusRepButton' />;
            </Row>
            <Row
                name='Reputation message'
                description={
                    'The content of the comment you want posted on someone\'s profile when the "+rep" button is pressed, defaults to simply "+rep"'
                }
            >
                <ModalTextBox id='reputationMessage' modalTitle='Enter your reputation message key here' />;
            </Row>
            <Row
                name='Show "Reocc" button'
                description='Puts a "Reocc" button on your own profile which when pressed comments your reoccuring message'
            >
                <FlipSwitchStorage id='showReoccButton' />;
            </Row>
            <Row
                name='Reoccuring message'
                description={`The content of the comment you want posted on your profile when the "Reocc" button is pressed, 
          defaults to "I don't have other accounts. If someone adds you with my name and picture they are scammers."`}
            >
                <ModalTextBox id='reoccuringMessage' modalTitle='Enter your reputation message key here' />;
            </Row>
            <Row
                name='NSFW'
                description='When enabled, it removes profile backgrounds and artwork from profiles. Ideal for work and school environment -
                when you want to avoid anime boobs showing on your screen.'
            >
                <FlipSwitchStorage id='nsfwFilter' />;
            </Row>
            <Row
                name='Remove animated profile backgrounds'
                description='When enabled, it removes animated profile backgrounds from profiles. They can be quite annoying and can cause performance issues.'
            >
                <FlipSwitchStorage id='removeAnimatedProfileBackgrounds' />;
            </Row>
            <Row
                name='Show real status'
                description={
                    <>
                        Shows users&apos; real chat status on their profile - if they are away it will show away.
                        <ApiKeyIndicator />
                    </>
                }
            >
                <FlipSwitchStorage id='showRealStatus' />;
            </Row>
        </Category>
    );
};

export default profile;
