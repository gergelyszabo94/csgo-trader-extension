// Play sound with access to DOM APIs
const playAudio = (source, volume) => {
  const audio = new Audio(source);
  audio.volume = volume;
  audio.play();
};

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((msg) => {
  if ('playAudio' in msg) playAudio(msg.playAudio.sourceURL, msg.playAudio.volume);
});
