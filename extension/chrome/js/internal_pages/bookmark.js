chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.alert !== undefined){
            alert(`${request.alert} is now tradable!`);
            sendResponse({alert: request.alert})
        }
    });

chrome.storage.local.get('bookmarks', (result) => {
    if (result.bookmarks.length !== 0){
        let bookmarks = [];
        result.bookmarks.forEach((element, index) => {
            let iconFullURL= `https://steamcommunity.com/economy/image/${element.itemInfo.iconURL}/256x256`;
            let notify = element.notify ? 'checked' : '';
            //let notifOptionsVisibility = element.notify ? 'block' : 'none';
            let visible = element.notify ? '' : 'hidden';

            let exterior = element.itemInfo.exterior.localized_name;
            let bookmark = `<div class="buildingBlock">
         <div class="row">
            <div class="col-5">
                <h3>${element.itemInfo.name}</h3>
                <h4>${exterior}</h4>
                <img src="${iconFullURL}">
            </div>
            <div class="col-4 mid-column" data-tradability="${element.itemInfo.tradability}">
                <h4 class="tradability" data-tradability="${element.itemInfo.tradability}">Tradable after ${new Date(element.itemInfo.tradability).toString().split("GMT")[0]}</h4>
                <h4 class="countdown" data-countdown="${element.itemInfo.tradability}"></h4>
                <div class="notifyDiv" data-tradability="${element.itemInfo.tradability}">
                <h4 class="notifySwitch">Notify</h4> 
                <label class="switch">
                    <input type="checkbox" class="notify" data-index="${index}" ${notify}>
                    <span class="slider round"></span>
                </label>
                <div class="notifOptions ${visible}" data-index="${index}">
                    <h5 class="someSpaceBefore">How do you want to be notified?</h5>
                    <select class="select-theme notifType" data-index="${index}">
                      <option value="chrome">Browser desktop notification</option>
                      <option value="alert">Browser alert (to focus)</option>
                    </select>
                    <h5 class="someSpaceBefore">When do you want to be notified?</h5>
                    <input class="numberPicker" type="number" value="0" min="0" max="60">
                     <select class="select-theme minutesOrHours" data-index="${index}">
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                    </select>
                    <select class="select-theme beforeOrAfter" data-index="${index}">
                      <option value="before">before</option>
                      <option value="after">after</option>
                    </select>
                    <div class="saveIcon"><i class="fas fa-save whiteIcon saveNotifDetails" title="Save notification options" data-index="${index}"></i></div>
                </div>
            </div>
            </div>
            <div class="col-3">
            <div style="text-align: right">
            <a href="https://steamcommunity.com/tradeoffer/new/?partner=${getOfferStyleSteamID(element.owner)}" target="_blank"><i class="fas fa-exchange-alt whiteIcon" title="Send a trade to the owner (if friends)"></i></a>
            <a href="${element.itemInfo.marketlink}" target="_blank"><i class="fas fa-chart-line whiteIcon" title="Open the item's Steam Market page"></i></a>
            <a href="${"https://steamcommunity.com/profiles/" + element.owner + "/inventory/#730_2_" + element.itemInfo.assetid}" target="_blank"><i class="fas fa-link whiteIcon" title="Open the item in the owner's inventory"></i></a>
            <a href="https://steamcommunity.com/profiles/${element.owner}/" target="_blank"><i class="fas fa-user whiteIcon" title="Open the item's owner's profile page"></i></a>
            <i class="fas fa-trash remove" data-index="${index}" title="Remove the item from your bookmarks"></i>
            </div>
            <h4>Comment</h4>
                <textarea class="comment orangeBox" data-index="${index}">${element.comment}</textarea>
            </div>
        </div>
        </div>`;
            bookmarks.push(bookmark);
        });

        document.getElementById('bookmarks').innerHTML = bookmarks.join('');

        // removes options on tradable items
        document.querySelectorAll('.mid-column').forEach(tradabilityColumn => {
            let tradableAt = new Date(tradabilityColumn.getAttribute('data-tradability'));
            if (tradableAt < Date.now() || tradabilityColumn.getAttribute('data-tradability') === 'Tradable'){
                tradabilityColumn.innerHTML = `<h4 class="tradable">Tradable</h4>`;
            }
        });

        // fills in the notification options details
        chrome.storage.local.get('bookmarks', (result) => {
            document.querySelectorAll('.notifOptions').forEach(options => {
                let index = options.getAttribute('data-index');
                let whenDetails = reverseWhenNotifDetails(result.bookmarks[index].itemInfo.tradability,result.bookmarks[index].notifTime);

                options.querySelector('.notifType').value = result.bookmarks[index].notifType;
                options.querySelector('.numberPicker').value = whenDetails.numberOfMinutesOrHours;
                options.querySelector('.minutesOrHours').value = whenDetails.minutesOrHours;
                options.querySelector('.beforeOrAfter').value = whenDetails.beforeOrAfter;
            });
        });

        // adds countdowns
        document.querySelectorAll('[data-countdown]').forEach(countdown => {
           if (countdown.getAttribute('data-countdown') !== 'Tradable' && countdown.getAttribute('data-countdown') !== 'Non-Tradable'){
               let countdownDate = new Date(countdown.getAttribute('data-countdown'));

               let x = setInterval(() => {
                   let distance = countdownDate - Date.now();

                   let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                   let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                   let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                   let seconds = Math.floor((distance % (1000 * 60)) / 1000);

                   countdown.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s `;

                   if (distance < 0) {
                       clearInterval(x);
                       countdown.classList.add('hidden');
                   }
               }, 1000);
           }
           else countdown.classList.add('hidden');
        });

        // handles notification options saving
        document.querySelectorAll('.saveNotifDetails').forEach(detail => {
           detail.addEventListener('click', (event) => {
               let index = event.target.getAttribute('data-index');

               let notifType = event.target.parentNode.parentNode.querySelector('.notifType').value;
               let numberOfMinutesOrHours = event.target.parentNode.parentNode.querySelector('.numberPicker').value;
               let minutesOrHours = event.target.parentNode.parentNode.querySelector('.minutesOrHours').value;
               let beforeOrAfter = event.target.parentNode.parentNode.querySelector('.beforeOrAfter').value;

               chrome.storage.local.get('bookmarks', (result) => {
                   let bookmarks = result.bookmarks;
                   let tradableDate = result.bookmarks[index].itemInfo.tradability;
                   bookmarks[index].notifTime = determineNotificationDate(tradableDate,minutesOrHours, numberOfMinutesOrHours, beforeOrAfter).toString();
                   bookmarks[index].notifType = notifType;
                   chrome.storage.local.set({bookmarks: bookmarks}, () => {chrome.runtime.sendMessage({setAlarm: {name:  bookmarks[index].itemInfo.assetid, when: bookmarks[index].notifTime}}, (response) => {})});
               });
           });
        });

        // remove bookmark logic
        document.querySelectorAll('.remove').forEach(removeButton => {
           removeButton.addEventListener('click', (event) => {
               let index = event.target.getAttribute('data-index');

               chrome.storage.local.get('bookmarks', (result) => {
                   let assetID = result.bookmarks[index].itemInfo.assetid;
                   result.bookmarks.splice(index, 1);
                   chrome.storage.local.set({'bookmarks': result.bookmarks}, () => {chrome.alarms.clear(assetID, () => {location.reload()})});
               });
           })
        });

        // comments logic
        document.querySelectorAll('.comment').forEach(commentBox => {
           commentBox.addEventListener('input', (event) => {
               let index = event.target.getAttribute('data-index');

               let newComment = event.target.value;
               chrome.storage.local.get('bookmarks', (result) => {
                   let bookmarks = result.bookmarks;
                   bookmarks[index].comment = newComment;
                   chrome.storage.local.set({bookmarks: bookmarks}, () => {});
               });
           })
        });

        // alarm setting logic
        document.querySelectorAll('.notify').forEach(notifyToggle => {
            notifyToggle.addEventListener('click', (event) => {
                let index = event.target.getAttribute('data-index');

                // shows or hides the notifications options menu
                event.target.parentNode.nextElementSibling.classList.toggle('hidden');

                chrome.storage.local.get('bookmarks', (result) => {
                    let bookmarks = result.bookmarks;

                    bookmarks[index].notify = event.target.checked;

                    if (event.target.checked) chrome.storage.local.set({bookmarks: bookmarks}, () => {chrome.runtime.sendMessage({setAlarm: {name:  bookmarks[index].itemInfo.assetid, when: bookmarks[index].notifTime}}, (response) => {})});
                    else chrome.storage.local.set({bookmarks: bookmarks}, () => {chrome.alarms.clear(bookmarks[index].itemInfo.assetid, () => {})});
                });
            });
        });
    }
});