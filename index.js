const prompt = require('prompt-sync')();
const fs = require('fs');
const { re, complete } = require('./extract');
const { Browser } = require('./note');

const ConsoleWindow = require("node-hide-console-window");
ConsoleWindow.hideConsole();

async function main () {    
    const fName = process.argv[2];
    const lName = process.argv[3];
    const user = '';
    const pw = '';
    const PIN = process.argv[4].split('');
    const date = process.argv[5];
    const parentUnaware = Number(process.argv[6]);
    const eqids = process.argv[7];
    const details = process.argv[8];

    let unique_eqids = {}
    const eqidsToParse = [...eqids.matchAll(re)];

    eqidsToParse.forEach(v => {
        unique_eqids[v[0]] ? unique_eqids[v[0]] +=1 : unique_eqids[v[0]] = 1;
    });

    const browser = new Browser(false);
    await browser.init(false, 15);
    const authPage = await browser.auth(user, pw, PIN);
    await browser.createNotes({
        'date': date,
        'unaware': parentUnaware,
        'fName': fName,
        'lName': lName,
        'details': details
    }, unique_eqids);

    // await authPage.close();
    // browser.disconnect();

    console.log('Contact notes are ready to save!');
    console.log('Close the browser when finished.');
}

function getDetailFile(files) {
    const detailsFileName = prompt('Enter the name of the file containing the contact note details (press TAB to autocomplete): ', {
        autocomplete: complete(files)
    });

    try {
        return fs.readFileSync('./data/details/' + detailsFileName);
    } catch (error) {
        console.error('This file does not exist! Please try again.');
        console.info('(HINT: press tab to autocomplete)\n');
        return getDetailFile(files);
    }
}

function getEQIDsFile(files) {
    const eqidsFileName = prompt('Enter the name of the file containing desired EQIDs (press TAB to autocomplete): ', {
        autocomplete: complete(files)
    });

    try {
        return fs.readFileSync('./data/eqids/' + eqidsFileName);
    } catch (error) {
        console.error('This file does not exist! Please try again.');
        console.info('(HINT: press tab to autocomplete)\n');
        return getEQIDsFile(files);
    }
}

main();

// get details
// parse list
// 