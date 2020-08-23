import resolve from "resolve";

var GRADES_DATABASE = {};
async function executeQuery(query) {
    return new Promise((resolve, reject) => {
        try {
            var res = GRADES_DATABASE.exec(query)[0];
            console.log("executeQuery -> res", res);
            resolve(res);
        } catch (e) {
            reject(e);
        }
    });
}

/* Load the database*/
async function loadDataBase() {
    let dbFile = await loadBinaryFile("sql/grades.db");
    GRADES_DATABASE = new SQL.Database(dbFile);
    console.log("loadDataBase -> GRADES_DATABASE", GRADES_DATABASE);
    // await executeQuery("select * from agg;"); for testing
}

/* load the database from file */
async function loadBinaryFile(path) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", chrome.extension.getURL(path), true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function () {
            try {
                var data = new Uint8Array(xhr.response);
                var arr = new Array();
                for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                resolve(arr.join(""));
            } catch (e) {
                reject(e);
            }
        };
        xhr.send();
    });
}
export { loadDataBase };
