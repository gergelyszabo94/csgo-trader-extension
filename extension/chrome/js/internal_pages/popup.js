function doCurrencyConversion(){
    let number = parseInt(event.target.value);
    let targetID = event.target.id;
    let currencyLeft = currenciesLeft.options[currenciesLeft.selectedIndex].value;
    let currencyRight = currenciesRight.options[currenciesRight.selectedIndex].value;
    chrome.storage.local.get('exchangeRates', (result) => {
        let exchangeRateLeft = parseFloat(result.exchangeRates[currencyLeft]);
        let exchangeRateRight = parseFloat(result.exchangeRates[currencyRight]);
        if (targetID === 'numberInputLeft') numberInputRight.value = (number / exchangeRateLeft) * exchangeRateRight;
        else if (targetID === 'numberInputRight')  numberInputLeft.value = (number / exchangeRateRight) * exchangeRateLeft;
    });
}

trackEvent({
    type: 'pageview',
    action: 'ExtensionPopupView'
});

// if there is any badge text it gets removed
chrome.runtime.sendMessage({badgetext: ""}, (response) => {});

// sets extension version
let version = chrome.runtime.getManifest().version;
document.getElementById('version').innerText = version;

// adds the links dynamically
let links = document.getElementById('links');

chrome.storage.local.get(['popupLinks', 'steamIDOfUser'], (result) => {
    result.popupLinks.forEach(link =>{
        if(link.active){
            let div = document.createElement('div');
            let linkElement = document.createElement('a');
            div.appendChild(linkElement);
            let URL = link.id === 'tradeoffers' ? `https://steamcommunity.com/profiles/${result.steamIDOfUser}/tradeoffers` : link.url;
            linkElement.setAttribute('href', URL);
            linkElement.setAttribute('target', '_blank');
            linkElement.innerText = link.name;
            links.appendChild(div);
        }
    });
});


let currenciesRight = document.createElement('select');
currenciesRight.classList.add('select-theme');

for (let currency of Object.keys(currencies)){
    let option = document.createElement('option');
    option.value = currencies[currency].short;
    option.text = currencies[currency].short;
    currenciesRight.add(option);
}

let currenciesLeft = currenciesRight.cloneNode(true);
currenciesRight.id = 'currenciesRight';
currenciesLeft.id = 'currenciesLeft';
let calculator = document.getElementById('calculator');
let spanBetween = document.createElement('span');
spanBetween.style.margin = '5px';
spanBetween.innerText = ' to ';

calculator.appendChild(currenciesLeft);
calculator.appendChild(spanBetween);
calculator.appendChild(currenciesRight);

let numberInputRight = document.createElement('input');
numberInputRight.type = 'number';
numberInputRight.classList.add('numberPicker');
numberInputRight.style.width = '5rem';
let numberInputLeft = numberInputRight.cloneNode(true);
numberInputLeft.id = 'numberInputLeft';
numberInputRight.id = 'numberInputRight';
calculator.appendChild(numberInputLeft);
let betweenNumbers = document.createElement('span');
betweenNumbers.innerText = ' - ';
calculator.appendChild(betweenNumbers);
calculator.appendChild(numberInputRight);

let percentageCalc = document.getElementById('percentageCalculator');


document.getElementById('result1').addEventListener('click', (event) => {
    let percentage = parseInt(document.getElementById('percentage1').value);
    let number = parseInt(document.getElementById('percentage2').value);
    event.target.innerText = number * (percentage / 100);
});

document.getElementById('result2').addEventListener('click', (event) => {
    let percentage = parseInt(document.getElementById('percentage4').value);
    let number = parseInt(document.getElementById('percentage3').value);
    event.target.innerText = number / (percentage / 100);
});

document.getElementById('result3').addEventListener('click', (event) => {
    let percentage = parseInt(document.getElementById('percentage5').value);
    let number = parseInt(document.getElementById('percentage6').value);
    let incOrDecElement = document.getElementById('inc_dec');
    let incOrDec = incOrDecElement.options[incOrDecElement.selectedIndex].value;
    if (incOrDec === 'inc') event.target.innerText = number / ((percentage / 100) + 1.0);
    if (incOrDec === 'dec') event.target.innerText = number / (1.0 - (percentage / 100));
});

document.getElementById('toggleCalc').addEventListener('click', () => {
    calculator.classList.toggle('hidden');
    percentageCalc.classList.toggle('hidden');
});

chrome.storage.local.get('currency', (result) => {
    currenciesLeft.querySelector(`[value='${result.currency}']`).selected = true;
});

numberInputLeft.addEventListener('input', doCurrencyConversion);
numberInputRight.addEventListener('input', doCurrencyConversion);