const IS_EXT_DEV_MODE = !chrome.runtime.getManifest() || !('update_url' in chrome.runtime.getManifest());

function debugLog(...args) {
    if (args.length >= 1) {
        if (typeof args[0] === "string") {
            args[0] = `%c${args[0]}`;
            args = [args[0], 'color:white; background-color: #CC2B5E', ...args.slice(1)];
        }
    }
    if (IS_EXT_DEV_MODE) console.log(...args);
}

function debugRunFunction(func, args = {}) {
    if (IS_EXT_DEV_MODE) func(...args);
}

debugLog("extension unpacked");

export { IS_EXT_DEV_MODE, debugLog, debugRunFunction };