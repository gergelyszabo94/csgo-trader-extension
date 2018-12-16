function CurrencyIsWalletFunds(currency) {
    return currency.appid == 753 && currency.contextid == 4;
}

function ConvertToTheirCurrency(amount) {
    var flAmount = amount * g_rgWalletInfo['wallet_conversion_rate'];
    var nAmount = Math.floor(isNaN(flAmount) ? 0 : flAmount);

    return Math.max(nAmount, 0);
}

function ConvertToOurCurrency(amount) {
    var flAmount = g_rgWalletInfo['wallet_inverse_conversion_rate'] * ( amount  );

    var nAmount = Math.ceil(isNaN(flAmount) ? 0 : flAmount);
    nAmount = Math.max(nAmount, 0);

    // verify the amount. we may be off by a cent.
    if (ConvertToTheirCurrency(nAmount) != amount) {
        var i;
        for (i = nAmount - 2; i <= nAmount + 2; i++) {
            if (ConvertToTheirCurrency(i) == amount) {
                nAmount = i;
                break;
            }
        }
    }

    return nAmount;
}

function ConvertToOurCurrencyForDisplay(amount) {
    var flAmount = amount * g_rgWalletInfo['wallet_inverse_conversion_rate'];
    var nAmount = Math.floor(isNaN(flAmount) ? 0 : flAmount);

    return Math.max(nAmount, 0);
}

function CalculateFeeAmount(amount, publisherFee) {
    if (!g_rgWalletInfo['wallet_fee']) {
        return 0;
    }

    publisherFee = ( typeof publisherFee == 'undefined' ) ? 0 : publisherFee;

    // Since CalculateFeeAmount has a Math.floor, we could be off a cent or two. Let's check:
    var iterations = 0; // shouldn't be needed, but included to be sure nothing unforseen causes us to get stuck
    var nEstimatedAmountOfWalletFundsReceivedByOtherParty = parseInt(( amount - parseInt(g_rgWalletInfo['wallet_fee_base']) ) / ( parseFloat(g_rgWalletInfo['wallet_fee_percent']) + parseFloat(publisherFee) + 1 ));

    var bEverUndershot = false;
    var fees = CalculateAmountToSendForDesiredReceivedAmount(nEstimatedAmountOfWalletFundsReceivedByOtherParty, publisherFee);
    while (fees.amount != amount && iterations < 10) {
        if (fees.amount > amount) {
            if (bEverUndershot) {
                fees = CalculateAmountToSendForDesiredReceivedAmount(nEstimatedAmountOfWalletFundsReceivedByOtherParty - 1, publisherFee);
                fees.steam_fee += ( amount - fees.amount );
                fees.fees += ( amount - fees.amount );
                fees.amount = amount;
                break;
            } else {
                nEstimatedAmountOfWalletFundsReceivedByOtherParty--;
            }
        } else {
            bEverUndershot = true;
            nEstimatedAmountOfWalletFundsReceivedByOtherParty++;
        }

        fees = CalculateAmountToSendForDesiredReceivedAmount(nEstimatedAmountOfWalletFundsReceivedByOtherParty, publisherFee);
        iterations++;
    }

    // fees.amount should equal the passed in amount

    return fees;
}

function CalculateAmountToSendForDesiredReceivedAmount(receivedAmount, publisherFee) {
    if (!g_rgWalletInfo['wallet_fee']) {
        return receivedAmount;
    }

    publisherFee = ( typeof publisherFee == 'undefined' ) ? 0 : publisherFee;

    var nSteamFee = parseInt(Math.floor(Math.max(receivedAmount * parseFloat(g_rgWalletInfo['wallet_fee_percent']), g_rgWalletInfo['wallet_fee_minimum']) + parseInt(g_rgWalletInfo['wallet_fee_base'])));
    var nPublisherFee = parseInt(Math.floor(publisherFee > 0 ? Math.max(receivedAmount * publisherFee, 1) : 0));
    var nAmountToSend = receivedAmount + nSteamFee + nPublisherFee;

    return {
        steam_fee: nSteamFee,
        publisher_fee: nPublisherFee,
        fees: nSteamFee + nPublisherFee,
        amount: parseInt(nAmountToSend)
    };
}

function GetPriceValueAsInt(strAmount) {
    var nAmount;
    if (!strAmount) {
        return 0;
    }

    // strip the currency symbol, set commas to periods, set .-- to .00
    strAmount = strAmount.replace(GetCurrencySymbol(GetCurrencyCode(g_rgWalletInfo['wallet_currency'])), '').replace(',', '.').replace('.--', '.00');

    var flAmount = parseFloat(strAmount) * 100;
    nAmount = Math.floor(isNaN(flAmount) ? 0 : flAmount + 0.000001); // round down

    nAmount = Math.max(nAmount, 0);
    return nAmount;
}

function GetMarketHashName(rgDescriptionData) {
    if (typeof rgDescriptionData.market_hash_name != 'undefined') {
        return rgDescriptionData.market_hash_name;
    } else if (typeof rgDescriptionData.market_name != 'undefined') {
        return rgDescriptionData.market_name;
    } else {
        return rgDescriptionData.name;
    }
}
