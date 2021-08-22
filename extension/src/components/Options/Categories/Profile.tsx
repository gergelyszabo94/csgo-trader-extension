import ApiKeyIndicator from 'components/Options/ApiKeyIndicator';
import Category from '../Category';
import React from 'react';
import Row from 'components/Options/Row';

const profile = () => {
    return (
        <Category title='Profile'>
            <Row
                name='Show "+rep" button'
                id='showPlusRepButton'
                type='flipSwitchStorage'
                description='Puts a "+rep" button on profiles which when pressed comments your reputation message'
            />
            <Row
                name='Reputation message'
                id='reputationMessage'
                type='modalTextBox'
                description={
                    'The content of the comment you want posted on someone\'s profile when the "+rep" button is pressed, defaults to simply "+rep"'
                }
                modalTitle='Enter your reputation message key here'
            />
            <Row
                name='Show "Reocc" button'
                id='showReoccButton'
                type='flipSwitchStorage'
                description='Puts a "Reocc" button on your own profile which when pressed comments your reoccuring message'
            />
            <Row
                name='Reoccuring message'
                id='reoccuringMessage'
                type='modalTextBox'
                description={`The content of the comment you want posted on your profile when the "Reocc" button is pressed, 
          defaults to "I don't have other accounts. If someone adds you with my name and picture they are scammers."`}
                modalTitle='Enter your reoccuring message key here'
            />
            <Row
                name='NSFW'
                id='nsfwFilter'
                type='flipSwitchStorage'
                description='When enabled, it removes profile backgrounds and artwork from profiles. Ideal for work and school environment -
                when you want to avoid anime boobs showing on your screen.'
            />
            <Row
                name='Remove animated profile backgrounds'
                id='removeAnimatedProfileBackgrounds'
                type='flipSwitchStorage'
                description='When enabled, it removes animated profile backgrounds from profiles. They can be quite annoying and can cause performance issues.'
            />
            <Row
                name='Show real status'
                id='showRealStatus'
                type='flipSwitchStorage'
                description={
                    <>
                        Shows users&apos; real chat status on their profile - if they are away it will show away.
                        <ApiKeyIndicator />
                    </>
                }
            />
        </Category>
    );
};

export default profile;
