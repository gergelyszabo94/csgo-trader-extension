# Extension-hosted 3D Inspect Viewer

This records the CSP-compatible alternative to the in-page modal.

- The content script sends the selected inspect link and inspectable inventory items through `chrome.runtime.sendMessage({ openBrowserInspect: ... })`.
- `backgroundScripts/messaging.js` saves that payload to `chrome.storage.session` and opens an extension popup at `inspect.html` with `chrome.windows.create`.
- `inspect.html` hosts `inspect.js`, which renders the two-column inventory list and an iframe. Item selection updates the iframe `src`.
- `manifest.json` needs the `windows` permission and `frame-src https://3dview.cs2inspects.com` in `content_security_policy.extension_pages`.
- `webpack.config.js` needs an `inspect` entry and an `HtmlWebpackPlugin` instance that emits `inspect.html`.

The solution was removed from the active extension because the earlier in-page modal was requested instead. Restore these components if an embedded viewer that satisfies Steam's CSP is needed again.