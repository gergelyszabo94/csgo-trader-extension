import DOMPurify from 'dompurify';

import { logExtensionPresence, updateLoggedInUserInfo, addUpdatedRibbon } from 'utils/utilsModular';

logExtensionPresence();
updateLoggedInUserInfo();
addUpdatedRibbon();

const searchResultControls = document.getElementById('searchResults_controls');
if (searchResultControls !== null) {
    const currentPage =
        window.location.hash !== '' ? window.location.hash.split('_')[0].split('p')[1] : '1';

    searchResultControls.insertAdjacentHTML(
        'beforebegin',
        DOMPurify.sanitize(
            `Jump to page:
            <input type="number" id="pageNumInput" value="${currentPage}" style="width: 50px"/>
            <span id="goToPage" class="clickable" title="Navigate to this page">
                Go
            </span>`,
        ),
    );
    document.getElementById('goToPage').addEventListener('click', () => {
        const pageToGoTO = document.getElementById('pageNumInput').value;
        const hash = window.location.hash !== '' ? window.location.hash : 'p1_default_desc';

        const hashParts = hash.split('_');
        window.location.hash = `p${pageToGoTO}_${hashParts[1]}_${hashParts[2]}`;
    });
}
