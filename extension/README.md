# Browser Extension
## Parts/Structure
### UI
The extension uses React for the extension popup, the options and bookmark pages.
`src/index.js` is the single entry point for the UI.
The `src/pages` and `src/components` directories contain the React components that make up the interface.
The `src/assets/styles` directory contains the style sheets (Sass).
The UI occasionally uses some of the utilities defined in `src/utils`.

### Background Scripts
The `src/BackgroundScripts` directory contains the two background scripts.
`background.js` is mostly responsible for executing logic during the extension install and update.
Additionally `chrome.notification` and `chrome.alarms` are done here.
`messaging.js` functions largely as a proxy for content scripts to make network calls
that the content scripts themselves are unable to because of browser security policies.
The background scrips use `src/utils` extensively as ES6 modules.

### Content Scripts
`src/ContentScripts` and its steam subdirectory contain the content scripts that run on pages
where the extension adds functionality.
They manipulate the DOM, add additional logic, communicate with `messaging.js`,
inject js and styling into the page context to override and augment the page.
`src/manifest.json` determines witch content script runs on which page.
The content scrips use `src/utils` extensively as ES6 modules.

## Development, build, deploy
### Development
`npm run start` starts the development mode.
Webpack creates an initial build in `build` and re-compiles when changes are saved.
The extension can be loaded from this directory.
Changes to the UI are applied, but the pages have to be reopened.
To apply changes to a content or background script the extension has to be reloaded. 
Webpack runs the linter on code save and linting problems are printed when they occur.

### Build
`npm run build` creates a complete build in the `build` directory. 
he extension can be loaded form there afterwards.

### Deploy
AWS CodeBuild is manually started. The configuration is in `buildspec.yml`.
The resulting .zip files are pushed to S3 then manually published to the corresponding platforms.
They are also made available at `csgotrader.app/extension/latest/{chrome/firefox}.zip`
through CloudFront.