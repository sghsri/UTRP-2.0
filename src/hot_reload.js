import { ENABLE_FILE_SYSTEM_WATCHING, ENABLE_LOCAL_SERVER_WATCHING } from "./config";

// create an array of all the used extension files in the recursive file structure that chrome uses
const filesInDirectory = dir =>
    new Promise(resolve =>
        dir.createReader().readEntries(entries =>
            Promise.all(entries.filter(e => e.name[0] !== ".").map(e => (e.isDirectory ? filesInDirectory(e) : new Promise(resolve => e.file(resolve)))))
                .then(files => [].concat(...files))
                .then(resolve)
        )
    );

// get the build_info.json file that is created when we do our webpack compilation
async function getBuildInfoFile(dir) {
    let files = await filesInDirectory(dir);
    let buildInfo = files.find(f => f.name === "build_info.json");
    return buildInfo ? buildInfo : null;
}

async function assessValidity(dir) {
    let files = await filesInDirectory(dir);
    let manifest_files = ["content.css", "0.chunk.js", "background.js", "content.js", "hot_reload.js", "main.js", "main.css"];
    for (let file_name of manifest_files) {
        let file = files.find(f => f.name === file_name);
        if (!file) {
            return false;
        }
    }
    return true;
}

// refresh the active tab, and while that is still loading refresh the extension as a whole
function refreshExtension() {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
        }
        chrome.runtime.reload();
    });
}

// let us watch for the existence, deletion, and rebirth of the build_info.json file, which signifies that a compilation starts, is in progress, and is done
async function watchChanges(dir, lastTimestamp) {
    let buildInfo = await getBuildInfoFile(dir);
    let newTimestamp = buildInfo ? buildInfo.lastModified : null;
    if (lastTimestamp === undefined || lastTimestamp === newTimestamp) {
        // if first compilation or the files haven't changed in creation, let's keep on watching
        setTimeout(() => watchChanges(dir, newTimestamp), 1000);
    } else {
        if (newTimestamp) {
            // this means that the timestamps don't match up, so a compilation must have ended. Let's now refresh the extension
            let isValid = await assessValidity(dir);
            if (isValid) {
                refreshExtension();
            } else {
                console.log("%c[bevomon] error while building, listening for changes...", "color:white; background-color: #F44336;");
                setTimeout(() => watchChanges(dir, newTimestamp), 1000);
            }
        } else {
            // it looks like the file doesn't exist anymore (and not the first compilation) so let's wait for the compilation to find
            console.log("%c[bevomon] changes detected, rebuilding and refreshing...", "color:white; background-color: rgb(29, 148, 126);");
            setTimeout(() => watchChanges(dir, newTimestamp), 1000);
        }
    }
}

// async function watchForLocalServerChanges() {
//     let SERVER_LAST_CHANGED = null;
//     if (IS_LOCAL) {
//         console.log("%c[bevomon] listening for local server changes...", "color:white; background-color: rgb(29, 148, 126);");
//         setInterval(async () => {
//             try {
//                 let resp = await fetch(backend_url_base);
//                 let data = await resp.json();
//                 if (SERVER_LAST_CHANGED === null) {
//                     SERVER_LAST_CHANGED = data.restarted;
//                 }
//                 if (SERVER_LAST_CHANGED !== data.restarted) {
//                     // the server has restarted since we last checked, let us restart the serversss
//                     console.log("%c[bevomon] local server changes detected, refreshing extension...", "color:white; background-color: rgb(29, 148, 126);");
//                     SERVER_LAST_CHANGED = data.restarted;
//                     setTimeout(() => {
//                         refreshExtension();
//                     }, 500);
//                 }
//             } catch (e) {
//                 console.log(`%c[bevomon] local server is not running...`, "color:white; background-color: #F44336;");
//             }
//         }, 1000);
//     }
// }

chrome.management.getSelf(self => {
    if (self.installType === "development" && !("update_url" in chrome.runtime.getManifest())) {
        if (ENABLE_FILE_SYSTEM_WATCHING) {
            console.log("%c[bevomon] listening for changes...", "color:white; background-color: rgb(29, 148, 126);");
            chrome.runtime.getPackageDirectoryEntry(dir => watchChanges(dir));
        } else {
            console.log("%c[bevomon] file system watching disabled", "color:white; background-color: #F37C34;");
        }
        // if (ENABLE_LOCAL_SERVER_WATCHING) {
        //     watchForLocalServerChanges();
        // } else {
        //     if (IS_LOCAL) {
        //         console.log("%c[bevomon] local server watching disabled", "color:white; background-color: #F37C34;");
        //     }
        // }
    }
});
