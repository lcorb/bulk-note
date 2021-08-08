const prompt = require('prompt-sync')();
const fs = require('fs');
const { re, complete } = require('./extract');
const { Browser } = require('./note');

async function main () {
    const detailsFiles = fs.readdirSync('./data/details');
    const eqidFiles = fs.readdirSync('./data/eqids');
    if (!detailsFiles.length || !eqidFiles.length) {
        console.error(`No files found in one of the data folders!\nExiting...`);
    } else {
        const fName = prompt('Enter staff first name: ');
        const lName = prompt('Enter staff last name: ');
        const user = prompt('Enter your MIS ID: ');
        const pw = prompt('Enter your password: ', { echo: '*' });
        let PIN = prompt('Enter your OneSchool PIN: ', { echo: '*' });

        PIN = PIN.split('');
    
        const date = prompt('Enter the date of contact (dd-mm): ');

        const details = getDetailFile(detailsFiles).toString();
        const eqidsToParse = [...getEQIDsFile(eqidFiles).toString().matchAll(re)];
        
        let eqids = eqidsToParse.map(v => v[0]);

        const browser = new Browser(false);
        await browser.init(false, 0);
        await browser.auth(user, pw, PIN);
        await browser.createNotes({
            'date': date,
            'fName': fName,
            'lName': lName,
            'details': details
        }, eqids);
    }
}

function getDetailFile(files) {
    const detailsFileName = prompt('Enter the name of the file containing the contact details: ', {
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
    const eqidsFileName = prompt('Enter the name of your Compass EQIDs .txt file: ', {
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