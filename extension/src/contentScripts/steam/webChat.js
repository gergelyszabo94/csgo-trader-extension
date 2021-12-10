import { logExtensionPresence } from 'utils/utilsModular';

let messagePresets = [];
let chatDialogObserverSet = false;

const removeHeader = () => {
  const header = document.querySelector('.main_SteamPageHeader_3EaXO');
  if (header !== null) header.remove();
};

const addChatPresets = () => {
  document.querySelectorAll('.DropTarget.chatWindow.MultiUserChat').forEach((chatDialog) => {
    let presetMessageSelect = chatDialog.querySelector('.messagePreset');
    if (!presetMessageSelect) {
      const chatEntryDiv = chatDialog.querySelector('.chatEntry.Panel.Focusable');

      if (chatEntryDiv) {
        const entryForm = chatEntryDiv.querySelector('form');

        if (entryForm) {
          presetMessageSelect = document.createElement('select');
          presetMessageSelect.classList.add('messagePreset');
          const disabledPlaceHolderOption = document.createElement('option');
          disabledPlaceHolderOption.setAttribute('disabled', '');
          disabledPlaceHolderOption.setAttribute('selected', '');
          disabledPlaceHolderOption.text = 'Select a message to send...';
          presetMessageSelect.appendChild(disabledPlaceHolderOption);

          messagePresets.forEach((message, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.text = `${message.substring(0, 50)}...`;
            presetMessageSelect.appendChild(option);
          });

          entryForm.insertAdjacentElement('afterend', presetMessageSelect);
          presetMessageSelect.addEventListener('change', () => {
            const messageArea = chatEntryDiv.querySelector('textarea');
            const submitButton = chatEntryDiv.querySelector('button[type=submit]');

            if (messageArea && submitButton) {
              messageArea.value = messagePresets[presetMessageSelect.selectedIndex + -1];
              messageArea.dispatchEvent(new Event('input', {
                bubbles: true,
                cancelable: true,
              }));
              submitButton.click();
            }
          });
        }
      }
    }
  });
};

// adds a mutation observer so the message presets are added
// when new chat dialogs are opened
const addChatDialogMutationObserver = () => {
  const chatDialogsEl = document.querySelector('.chatDialogs');

  if (chatDialogsEl) {
    chatDialogObserverSet = true;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) addChatPresets();
      });
    });

    observer.observe(chatDialogsEl, {
      childList: true,
      subtree: false,
      attributes: false,
    });
  }
};

chrome.storage.local.get(['removeWebChatHeader', 'showChatPresetMessages', 'chatPresetMessages'], ({
  removeWebChatHeader, chatPresetMessages, showChatPresetMessages,
}) => {
  if (removeWebChatHeader) {
    const tryToRemoveHeaderPeriodically = setInterval(() => {
      removeHeader();
    }, 5000);

    setTimeout(() => {
      clearInterval(tryToRemoveHeaderPeriodically);
    }, 60000);
  }

  if (showChatPresetMessages) {
    messagePresets = chatPresetMessages;
    addChatPresets();
    addChatDialogMutationObserver();

    setTimeout(() => {
      addChatPresets();
      if (!chatDialogObserverSet) addChatDialogMutationObserver();
    }, 10000);
    setInterval(() => {
      addChatPresets();
      if (!chatDialogObserverSet) addChatDialogMutationObserver();
    }, 30000);
  }
});

logExtensionPresence();
