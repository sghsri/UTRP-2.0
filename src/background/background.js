import axios from "axios";
import { sleep } from "../lib/constants/time";
import { debugLog, IS_EXT_DEV_MODE } from "../lib/utils/debug";

import { setDefaultOptions, getOptionsValue, setOptionsValue } from "./utils/options";

var cheerio = require("cheerio");

onInit();

function onInit() {
    chrome.storage.local.get(null, storage => {
        debugLog("extension storage:", storage);
    });
    setUpStorage();
}

function setUpStorage() {
    chrome.storage.local.get("ex", function (data) {
        if (!data.ex) {
            chrome.storage.local.set({ ex: 0 });
        }
    });
}

/// Initially set the tracked_items and default options
chrome.runtime.onInstalled.addListener(function (details) {
    setDefaultOptions();
    if (details.reason === "install") {
        chrome.tabs.create({ url: "welcome page" }, function () {});
        setUpStorage();
    } else if (details.reason === "update") {
        console.log("do something");
    }
});

// Handle messages and their commands from content and popup scripts
chrome.runtime.onMessage.addListener(function (request, sender, response) {
    switch (request.command) {
        case "getOptionsValue":
            getOptionsValue(request.key, response);
            break;
        case "setOptionsValue":
            setOptionsValue(request.key, request.value, response);
            break;
        default:
            const xhr = new XMLHttpRequest();
            const method = request.method ? request.method.toUpperCase() : "GET";
            xhr.open(method, request.url, true);
            xhr.onload = () => {
                response(xhr.responseText);
            };
            xhr.onerror = () => response(xhr.statusText);
            if (method === "POST") {
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }
            xhr.send(request.data);
            break;
    }
    return true;
});
