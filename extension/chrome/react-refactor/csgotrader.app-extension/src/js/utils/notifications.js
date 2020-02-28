const determineNotificationDate = (tradableDate, minutesOrHours, numberOfMinutesOrHours, beforeOrAfter) => {
    let baseTimeUnit = 0;
    if (minutesOrHours === 'minutes') baseTimeUnit = 60;
    else if (minutesOrHours === 'hours') baseTimeUnit = 3600;
    if (beforeOrAfter === 'before') baseTimeUnit *= -1;
    const timeDifference = numberOfMinutesOrHours * baseTimeUnit;

    return new Date((parseInt((new Date(tradableDate).getTime() / 1000).toFixed(0)) + timeDifference) * 1000);
};

const reverseWhenNotifDetails = (tradability, notifTime) => {
    const difference = (parseInt(new Date(notifTime).getTime() / 1000).toFixed(0)) - (parseInt(new Date(tradability).getTime() / 1000).toFixed(0));
    const differenceAbs =  Math.abs(difference);

    return {
        numberOfMinutesOrHours: differenceAbs / 60 >= 60 ? ( differenceAbs / 60) / 60 : differenceAbs / 60,
        minutesOrHours: differenceAbs / 60 >= 60 ? 'hours' : 'minutes',
        beforeOrAfter: difference >= 0 ? 'after' : 'before'
    };
};

export { reverseWhenNotifDetails, determineNotificationDate };