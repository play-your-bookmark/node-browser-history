let history = require("./index");

function testGetChromeOnly() {
    const date = new Date();
    console.log("***** RUNNING GET CHROME ONLY *****");
    return new Promise(res => {
        history.getChromeHistory(20, date.toISOString()).then(history => {
            console.log("PASS GET CHROME ONLY");
            console.log(history);
            res(history);
        }).catch(error => {
            console.log("***** FAIL TO GET CHROME ONLY *****");
            return Promise.reject(error);
        });
    });
}

let tests = [
    testGetChromeOnly(),
];

Promise.all(tests).then(() => {
    console.log("PASSING ALL TESTS");
    process.exit(0);
}).catch(error => {
    console.log('***** Error *****')
    console.log(error)
    process.exit(error);
});
