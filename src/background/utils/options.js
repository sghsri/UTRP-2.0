import { DEFAULT_EXTENSION_OPTIONS } from "../../config";
function setDefaultOptions() {
    chrome.storage.local.get("options", function (data) {
        if (!data.options) {
            chrome.storage.local.set({ options: DEFAULT_EXTENSION_OPTIONS });
        }
    });
}

function getOptionsValue(key, sendResponse) {
    chrome.storage.local.get("options", function (data) {
        if (!data.options) {
            setDefaultOptions();
        } else {
            sendResponse({ value: data.options[key] });
        }
    });
}

function setOptionsValue(key, value, sendResponse) {
    chrome.storage.local.get("options", function (data) {
        let new_options = data.options;
        if (!data.options) {
            setDefaultOptions();
            new_options = DEFAULT_EXTENSION_OPTIONS;
        }
        new_options[key] = value;
        chrome.storage.local.set(
            {
                options: new_options,
            },
            () => sendResponse({ value: new_options[key] })
        );
    });
}

export { setDefaultOptions, getOptionsValue, setOptionsValue };
