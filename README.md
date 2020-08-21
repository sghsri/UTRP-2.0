# UT Registration Plus

![logo](/public/icons/icon128.png)

## How to begin Development

0. Run either `npm run dev` to build the extension and watch for changes
1. go to `Chrome://extensions` and toggle Developer Mode
2. Click the load unpacked button and then navigate to the "build" folder and load from there
3. The extension should be running now!
4. I've added in `hot_reload.js` hot reloading for the extension! no need to ever have to manually refresh the extension again :)
5. Add your injection code into `content.js`. For content scripts, Treat `content.js` as index.js or App.js, everything should stem from it.
6. For the Extension Popup, index.js is where all your code should exist. It is injected into the `index.html` file in the `public` folder

## NPM Scripts:

1. `npm install` will install all the dependencies you will need
2. `npm run dev` will build a DEVELOPMENT version of the extension with HOT RELOADING, and then watch the `src` folder for changes, building automatically into the `build` folder.
3. `npm run build` will build a DEVELOPMENT version of the extension ONCE.
4. `npm run prod` will build a PRODUCTION version of the extension ONCE.
5. `npm test` will run all the tests (files that have the `.test.js` extension)in the `tests` folder once.

## More Information:

-   Content scripts `(src/content.js)` run on each tab that is matched by the site regex specified in manifest.json. For our purposes, we've set this to work on "all urls".
-   Background scripts `(src/background.js)` persist across all chrome windows and tabs (i.e there is only one instance of the background script running). We want to put things like modifying the storage, handling events/notifications, etc here.
-   IMPORTANT: You want to be familiar with the [Chrome APIs](https://developer.chrome.com/extensions/api_index).
-   For this extension, I've set it up so that the popup just toggles the content script popup injection on the page, instead of having a separate popup.html that gets rendered. I think for the most part that does what we need, but if we change our minds about that it's as simple as adding "index.html" as the default browser action in the manifest.json.

#### NOTES:

1. Because we have to webpack everything and do code splitting, some error messages are just not verbose at all, so keep that in mind. Some common issues that will just break stuff without good errors are
    - Not including all the built js files in the manifest.json
    - Any error that relates to ReactDOM trying to render things that don't exist, that haven't been defined yet, etc
2. from what I can understand I've set it up so that all the modules / libraries are compiled to 0.chunk.js, index.js -> main.js, and everything else should be 1:1 with file-name to compiled-name
3. I set in the webpack config the `plugins` setting to include
   `new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 2 })`
   simply because keeping the manifest.json up to date with more liberal code splitting was getting really annoying whenever I added a new dependency. I don't have the most knowledge with webpack so we should definately revisit this and decide if in the prod version we let webpack decide how many chunks
4. I have turned off Source Mapping due to the insane amount of time it caused the builds to balloon too.
