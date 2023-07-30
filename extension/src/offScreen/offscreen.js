import DOMPurify from 'dompurify';

// Play sound with access to DOM APIs
const playAudio = (source, volume) => {
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play();
};

const scrapeAPIKey = () => new Promise((resolve, reject) => {
  const getRequest = new Request('https://steamcommunity.com/dev/apikey');

  fetch(getRequest).then((response) => {
    if (!response.ok) {
      console.log(`Error code: ${response.status} Status: ${response.statusText}`);
      reject(response.statusText);
    } else return response.text();
  }).then((body) => {
    let apiKey = null;

    try {
      const html = document.createElement('html');
      html.innerHTML = DOMPurify.sanitize(body);
      apiKey = html.querySelector('#bodyContents_ex').querySelector('p').innerText.split(': ')[1];
      resolve(apiKey);
    } catch (e) {
      console.log(e);
      console.log(body);
      reject(e);
    }
  }).catch((err) => {
    console.log(err);
  });
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if ('playAudio' in message) {
    playAudio(message.playAudio.sourceURL, message.playAudio.volume);
  } else if ('scrapeAPIKey' in message) {
    scrapeAPIKey().then((apiKey) => {
      sendResponse(apiKey);
    }).catch((err) => {
      console.log(err);
      sendResponse(null);
    });
    return true; // async return to signal that it will return later
  }
});
