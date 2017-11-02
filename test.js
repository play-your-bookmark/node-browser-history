let getHistory = require("./index");


function singleRun() {
    return new Promise((res, rej) => {
        getHistory().then(function (history) {
            res(history);
        }).catch(function (error) {
            console.log("***** FAIL Single Run Test *****");
            rej(error);
        });
    });
}

function concurrencyLockTest() {
    console.log("Running Concurrency Lock Test");
    let pass = true;
    for (let x = 0; x < 100; x++) {
        getHistory().then(function (history) {
            //Don't comment this in unless you want to see 100x the same history
            //console.log(history);
        }).catch(function (someError) {
            pass = false;
            console.error(someError);
        });
    }
    if (!pass) {
        console.log("****** FAIL Concurrency Lock Test ******");
        return 1;
    }
    console.log("PASS Concurrency Lock Test");
    return 0;
}

singleRun().then(history => {
    console.log(history);
    console.log("PASS Single Run Test");
    process.exit(0);
}, error => {
    console.error(error);
    process.exit(1);
});
//concurrencyLockTest();

//var edge = require('edge');
//
//// The text in edge.func() is C# code
//var helloWorld = edge.func('async (input) => { return input.ToString(); }');
//
//helloWorld('Hello World!', function (error, result) {
//    if (error) throw error;
//    console.log(result);
//});

