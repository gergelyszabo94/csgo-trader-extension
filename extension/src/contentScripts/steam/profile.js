import {
  logExtensionPresence, updateLoggedInUserInfo, updateLoggedInUserName,
  warnOfScammer, reloadPageOnExtensionReload, removeLinkFilterFromLinks,
  addUpdatedRibbon, copyToClipboard, changePageTitle,
} from 'utils/utilsModular';
import { dateToISODisplay, prettyTimeAgo } from 'utils/dateTime';
import { addReplyToCommentsFunctionality, addCommentsMutationObserver, reportComments } from 'utils/comments';
import { goldenMiniProfileHandler, goldenCommenters } from 'utils/goldening';
import steamTextFormattingTags from 'utils/static/steamTextFormatingTags';
import { overrideShowTradeOffer } from 'utils/steamOverriding';
import steamProfileStatuses from 'utils/static/steamProfileStatuses';
import { injectStyle } from 'utils/injection';
import { getUserSteamID, getProfileOwnerSteamID, getOfferStyleSteamID } from 'utils/steamID';
import DOMPurify from 'dompurify';

// ensures that we are on a profile page, it's not possible with simple regex
if (document.querySelector('body').classList.contains('profile_page')) {
  logExtensionPresence();
  updateLoggedInUserInfo();
  updateLoggedInUserName();
  addUpdatedRibbon();
  removeLinkFilterFromLinks();
  const profileOwnerSteamID = getProfileOwnerSteamID();
  const loggedInUserID = getUserSteamID();

  const profileActionPopup = document.getElementById('profile_action_dropdown');
  const isProfilePrivate = (profileActionPopup === null && profileOwnerSteamID !== loggedInUserID);

  addReplyToCommentsFunctionality();
  addCommentsMutationObserver();

  // changes background and adds a banner if steamrep banned scammer detected
  chrome.storage.local.get('markScammers', (result) => {
    if (result.markScammers) warnOfScammer(profileOwnerSteamID, 'profile');
  });

  // resizes the elements where the rep or reoccuring buttons will be inserted
  const commentThreadEntryBox = document.querySelector('.commentthread_entry_quotebox');
  if (commentThreadEntryBox !== null) commentThreadEntryBox.setAttribute('style', 'width: 83%; display: inline-block;');

  // makes profiles with csgotrader.app in their name gold
  // top friends:
  const topFriends = document.querySelector('.profile_friend_links');
  if (topFriends !== null) {
    topFriends.querySelectorAll('.friendBlock').forEach((friendBlock) => {
      if (friendBlock.innerText.toLowerCase().includes('csgotrader.app')) {
        friendBlock.classList.add('golden');
        friendBlock.querySelector('.playerAvatar').classList.add('golden');
        friendBlock.addEventListener('mouseover', goldenMiniProfileHandler);
      }
    });
  }

  // profile name, level, avatar:
  const personaName = document.querySelector('.actual_persona_name');
  if (personaName !== null && personaName.innerText.toLowerCase().includes('csgotrader.app')) {
    personaName.classList.add('golden');
    const level = document.querySelector('.persona_level');
    if (level !== null) level.classList.add('golden');
    const avatar = document.querySelector('.profile_header').querySelector('.playerAvatar');
    if (avatar !== null) avatar.classList.add('golden');
  }

  goldenCommenters();

  if (loggedInUserID === profileOwnerSteamID) { // when on the logged in user's own profile
    chrome.storage.local.get(['reoccuringMessage', 'showReoccButton'], ({ reoccuringMessage, showReoccButton }) => {
      if (showReoccButton) {
        const reooccButton = '<div style="float: right; text-align: center; margin-top: 6px;" class="commentthread_user_avatar playerAvatar"><span class="btn_green_white_innerfade btn_small" id="reocc" style="padding: 5px;">Reocc<span></div>';

        commentThreadEntryBox.insertAdjacentHTML('afterend', DOMPurify.sanitize(reooccButton));

        document.getElementById('reocc').addEventListener('click', () => {
          document.querySelectorAll('.commentthread_comment.responsive_body_text').forEach((commentThread) => {
            // regex: replaces whitespaces and steam text formatting tags
            let toReplace = '';
            steamTextFormattingTags.forEach((tag) => {
              toReplace += `${tag.replace('[', '\\[').replace(']', '\\]')}|`;
            });
            toReplace += '\\s';
            const toReplaceRegex = new RegExp(toReplace, 'g');

            if (commentThread.querySelector('.commentthread_comment_text').innerText.replace(toReplaceRegex, '') === reoccuringMessage.replace(toReplaceRegex, '')) {
              commentThread.querySelectorAll('img')[1].click();
            }
          });
          document.querySelector('.commentthread_textarea').value = reoccuringMessage;
          setTimeout(() => {
            document.querySelectorAll('.btn_green_white_innerfade.btn_small')[1].click();
          }, 2000);
        });
      }
    });

    changePageTitle('own_profile');
  } else if (!isProfilePrivate) { // when on someone else's profile that is not private
    // adds "copy profile permalink" and "show offer history" to the context menu
    const copyPermalink = `
      <a class="popup_menu_item" href="#" id="copy_profile_perma_link">
        <img style="width: 16px; height: 16px" src="${chrome.runtime.getURL('images/paperclip.png')}">
            &nbsp; Copy Profile Permalink
      </a>`;
    const showOfferSummary = `
        <a class="popup_menu_item" href="#" id="show_offer_history">
            <img style="width: 16px; height: 16px" src="https://steamcommunity-a.akamaihd.net/public/images/profile/icon_tradeoffers.png">
            &nbsp; Show Offer History
        </a>`;
    const copyTradeLink = `
      <a class="popup_menu_item" href="#" id="copy_trade_link">
        <img style="width: 16px; height: 16px" src="${chrome.runtime.getURL('images/paperclip.png')}">
            &nbsp; Copy Trade Link
      </a>`;
    const openSteamRepProfile = `
      <a class="popup_menu_item" href="https://steamrep.com/profiles/${profileOwnerSteamID}">
        <img style="width: 16px; height: 16px" src="${chrome.runtime.getURL('images/plus.png')}">
            &nbsp; Open SteamRep Profile
      </a>`;
    const openCSGORepProfile = `
      <a class="popup_menu_item" href="https://csgo-rep.com/profile/${profileOwnerSteamID}">
        <img style="width: 16px; height: 16px" src="${chrome.runtime.getURL('images/growth.png')}">
            &nbsp; Open CSGO-REP Profile
      </a>`;
    profileActionPopup.querySelector('.popup_body.popup_menu.shadow_content').insertAdjacentHTML(
      'beforeend',
      copyPermalink + showOfferSummary + copyTradeLink + openSteamRepProfile + openCSGORepProfile,
      // not sanitized because it breaks the images and it's static anyways
    );

    document.getElementById('copy_profile_perma_link').addEventListener('click', () => {
      copyToClipboard(`https://steamcommunity.com/profiles/${profileOwnerSteamID}`);

      // for the context menu to go away
      document.querySelector('.playerAvatarAutoSizeInner').click();
    });

    document.getElementById('show_offer_history').addEventListener('click', () => {
      // prints trade offer history summary
      chrome.storage.local.get([`offerHistory_${profileOwnerSteamID}`, 'apiKeyValid'], (result) => {
        let offerHistory = result[`offerHistory_${profileOwnerSteamID}`];
        let offerSummaryElement = '';

        if (result.apiKeyValid) {
          if (offerHistory === undefined) {
            offerHistory = {
              offers_received: 0,
              offers_sent: 0,
              last_received: 0,
              last_sent: 0,
            };
          }
          offerSummaryElement = `
                        <div class="trade_partner_info_block" style="color: lightgray"> 
                            <div title=${dateToISODisplay(offerHistory.last_received)}>
                            Offers Received: ${offerHistory.offers_received} Last:  ${offerHistory.offers_received !== 0 ? prettyTimeAgo(offerHistory.last_received) : '-'}
                            </div>
                            <div title=${dateToISODisplay(offerHistory.last_sent)}>
                            Offers Sent: ${offerHistory.offers_sent} Last:  ${offerHistory.offers_sent !== 0 ? prettyTimeAgo(offerHistory.last_sent) : '-'}
                            </div>
                        </div>`;
        } else {
          offerSummaryElement = `
                        <div class="trade_partner_info_block" style="color: lightgray"> 
                            <div><b>CSGOTrader Extension:</b> It looks like you don't have your Steam API Key set yet.</div>
                            <div>If you had that you would see partner offer history here. Check the 
                                <a href="https://csgotrader.app/release-notes#1.23">Release Notes</a> 
                                for more info.
                            </div>
                        </div>`;
        }

        const profileStatusElement = document.querySelector('.responsive_status_info');

        if (profileStatusElement !== null) profileStatusElement.insertAdjacentHTML('beforeend', DOMPurify.sanitize(offerSummaryElement));
        else document.querySelector('.profile_header_badgeinfo').insertAdjacentHTML('beforeend', DOMPurify.sanitize(offerSummaryElement));

        // for the context menu to go away
        document.querySelector('.playerAvatarAutoSizeInner').click();
      });
    });

    document.getElementById('copy_trade_link').addEventListener('click', () => {
      let tradeLink = `https://steamcommunity.com/tradeoffer/new/?partner=${getOfferStyleSteamID(profileOwnerSteamID)}`;
      document.querySelectorAll('a').forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href !== null && href.includes('steamcommunity.com/tradeoffer/new/?partner=')) {
          const iDFromProfile = href.split('new/?partner=')[1].split('&token')[0];
          if (iDFromProfile === getOfferStyleSteamID(profileOwnerSteamID).toString()) {
            tradeLink = href;
          }
        }
      });

      copyToClipboard(tradeLink);

      // for the context menu to go away
      document.querySelector('.playerAvatarAutoSizeInner').click();
    });

    // handles rep button related stuff
    chrome.storage.local.get(['reputationMessage', 'showPlusRepButton'], (result) => {
      if (result.showPlusRepButton) {
        const repButton = `
            <div style="float: right; text-align: center; margin-top: 6px;" class="commentthread_user_avatar playerAvatar">
                <span class="btn_green_white_innerfade btn_small" id="repper" style="padding: 5px;">
                    +rep
                <span>
            </div>`;

        if (commentThreadEntryBox !== null) {
          commentThreadEntryBox.insertAdjacentHTML('afterend', DOMPurify.sanitize(repButton));
          document.getElementById('repper').addEventListener('click', () => {
            document.querySelector('.commentthread_textarea').value = result.reputationMessage;
            setTimeout(() => {
              document.querySelectorAll('.btn_green_white_innerfade.btn_small')[1].click();
            }, 500);
          });
        }
      }
    });

    reportComments('profile', profileOwnerSteamID);
    changePageTitle('profile');
  }

  chrome.storage.local.get(['nsfwFilter', 'removeAnimatedProfileBackgrounds'], ({
    nsfwFilter, removeAnimatedProfileBackgrounds,
  }) => {
    if (nsfwFilter) {
      // makes the profile background the same as the default one
      document.querySelector('.no_header.profile_page').setAttribute('style', 'background-image: url(https://steamcommunity-a.akamaihd.net/public/images/profile/profile_bg.jpg); background-repeat: repeat-x; background-color: #262627;');
      document.querySelectorAll('.profile_content, body, .no_header.profile_page').forEach((element) => {
        element.classList.remove('has_profile_background');
      });

      // removes artwork, screenshot showcases
      document.querySelectorAll('.profile_background_holder_content, .screenshot_showcase, .profile_animated_background').forEach((element) => {
        element.remove();
      });

      // changes avatar to the default one
      document.querySelector('.playerAvatarAutoSizeInner').querySelector('img').setAttribute('src', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg');

      // removes holiday cheer
      if (document.querySelector('.golden_profile') !== null) {
        injectStyle('.profile_header_bg:before {background-image: url()}', 'holidayheaderstyle');
        document.querySelector('.golden_profile').classList.remove('golden_profile', '.profile_customization_snow');
        document.querySelector('.golden_profile_header').classList.remove('golden_profile_header');
        document.querySelector('.profile_header_bg_texture').classList.remove('profile_header_bg_texture');
        document.querySelector('.w19_side_background, .w19_pig, .w19_strings, .profile_header_bg, .profile_header_bg_texture').style.background = 'url()';
        document.querySelector('.w19_sides_position').innerHTML = '';
      }
    } else if (nsfwFilter || removeAnimatedProfileBackgrounds) {
      // removes animated backgrounds
      document.querySelectorAll('.profile_animated_background').forEach((element) => {
        element.remove();
      });
    }
  });

  // shows actual steam chat status if set in options
  chrome.storage.local.get('showRealStatus', (result) => {
    if (result.showRealStatus && !isProfilePrivate) {
      const statusDiv = document.querySelector('.profile_in_game.persona');
      // when there is right info column
      // (sometimes profiles are not private but set to not have that by the user)
      if (statusDiv !== null) {
        if (statusDiv.classList.contains('online')) {
          const textDiv = statusDiv.querySelector('.profile_in_game_header');

          chrome.runtime.sendMessage({ GetPersonaState: profileOwnerSteamID }, (response) => {
            if (response.apiKeyValid) {
              textDiv.innerText = steamProfileStatuses[response.personastate]
                ? steamProfileStatuses[response.personastate]
                : textDiv.innerText;
            }
          });
        }
      }
    }
  });

  overrideShowTradeOffer();
  reloadPageOnExtensionReload();
}
