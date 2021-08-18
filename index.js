const prompt = require('prompt-sync')();
const fs = require('fs');
const { re, complete } = require('./extract');
const { Browser } = require('./note');

process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
});

async function main () {
    // const detailsFiles = fs.readdirSync('./data/details');
    // const eqidFiles = fs.readdirSync('./data/eqids');
    // if (!detailsFiles.length || !eqidFiles.length) {
    //     console.error(`No files found in one of the data folders!\nExiting...`);
    // } else {
    //     const fName = prompt('Enter staff first name: ');
    //     const lName = prompt('Enter staff last name: ');
    //     const user = prompt('Enter your MIS ID: ');
    //     const pw = prompt('Enter your password: ', { echo: '*' });
    //     let PIN = prompt('Enter your OneSchool PIN: ', { echo: '*' });

    //     PIN = PIN.split('');
    
    //     const date = prompt('Enter the date of contact (dd-mm): ');

    //     const details = getDetailFile(detailsFiles).toString();
    //     const eqidsToParse = [...getEQIDsFile(eqidFiles).toString().matchAll(re)];
        
    //     // let eqids = eqidsToParse.map(v => v[0]);

    //     let unique_eqids = {}
        
    //     eqidsToParse.forEach(v => {
    //         unique_eqids[v[0]] ? unique_eqids[v[0]] +=1 : unique_eqids[v[0]] = 1;
    //     });

    const fName = process.argv[2];
    const lName = process.argv[3];
    const user = process.argv[4];
    const pw = process.argv[5];
    const PIN = process.argv[6].split('');
    const date = process.argv[7]
    const eqids = process.argv[8];
    const details = process.argv[9];

    let unique_eqids = {}
    
    eqids.forEach(v => {
        unique_eqids[v[0]] ? unique_eqids[v[0]] +=1 : unique_eqids[v[0]] = 1;
    });

    const browser = new Browser(false);
    await browser.init(false, 15);
    const authPage = await browser.auth(user, pw, PIN);
    await browser.createNotes({
        'date': date,
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

//main();


// get details
// parse list
// 