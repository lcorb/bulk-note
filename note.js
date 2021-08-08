const { findNumbersInKeypad, locations } = require('./auth.js');
const { racePromises } = require('./utils');
const prompt = require('prompt-sync')();
const pup = require('puppeteer');

class Browser {
    constructor() {
        this.browser = null;
    }

    init(headless = false, slowMo = 0) {
        return new Promise(async (resolve, reject) => {
            try {
                this.browser = await pup.launch({
                    args: ['--no-sandbox'],
                    headless,
                    slowMo
                });
                resolve();
            } catch (error) {
                reject(error);
            }                
        })
    }

    async initPage(page) {
        // ensure desktop version loading
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    
        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        return;
    }

    async createNotes(note, eqids) {
        return new Promise(async (resolve, reject) => {
            for (const eqid of eqids) {
                try {
                    for (const eqid of eqids) {
                        await this.createNote(note, eqid);
                    }
                } catch (e) {
                    console.error('Failed to create a note for ' + eqid);
                }
            }
            resolve();
        })
    }

    async createNote(note, eqid) {
        return new Promise(async (resolve, reject) => {
            const page = await this.browser.newPage();
            await this.initPage(page);
            await page.goto(`https://oslp.eq.edu.au/OSLP/student/MaintainContact.aspx?EQId=${eqid}`);

            const date = '#a_ocph_ucRecordOfContact_txtContactDt_txtDate';
            const typeSelector = '#a_ocph_ucRecordOfContact_cboContactType';
            const nameButton = '#a_ocph_ucRecordOfContact_txtContactWith_imgClear';
            const initiatedSelector = '#a_ocph_ucRecordOfContact_cboDetails';
            const schoolInitiatedSelector = '#a_ocph_ucRecordOfContact_cboDetails > option:nth-child(2)';
            const detailsSelector = '#a_ocph_ucRecordOfContact_txtNotes';

            await page.click(date);
            await page.keyboard.down('ControlLeft');
            await page.keyboard.press('KeyA');
            await page.keyboard.up('ControlLeft');
            await page.type(date, note.date);

            await page.select(typeSelector, 'E');

            await this.waitAndClick(page, nameButton);

            const lName = '#a_ocph_ucRecordOfContact_txtContactWith_txtFamilyName';
            const fName = '#a_ocph_ucRecordOfContact_txtContactWith_txtGivenNames';
            
            await page.waitForSelector(lName);
            await page.waitForSelector(fName);

            await page.type(lName, note.lName);
            await page.type(fName, note.fName);
            
            await page.select(initiatedSelector, 'SC');
            
            await page.type(detailsSelector, note.details);

            await this.waitAndClick(page, nameButton);

            resolve();
        })
    }

    async auth(user, pw , PIN) {
        const pages = await this.browser.pages();
        const page = pages[0];
        await page.goto('https://oslp.eq.edu.au');

        const tryKeyPad = () => {
            return new Promise(async (resolve, reject) => {
                try {
                    const keypad = await page.$('#a_ocph_ucKeypad_imgKeypad');
                    const box = await keypad.boundingBox();
                    const imgSelector = '#a_ocph_ucKeypad_imgKeypad'
                    const keypadImage = await page.$(imgSelector);
            
                    const keypadPath = './keypad/KeypadImage.png';
            
                    await keypadImage.screenshot({
                        path: keypadPath,
                        omitBackground: true
                    })
            
                    const keys = await findNumbersInKeypad(keypadPath);
            
                    PIN.forEach(async (v) => {
                        await page.mouse.click(
                            box.x + locations[keys[v]][0],
                            box.y + locations[keys[v]][1]);
                    })
        
                    await this.waitAndClick(page, '#a_ocph_ucKeypad_imgSubmit');

                    resolve();
                } catch (error) {
                    // Theres a really weird edge case that causes this function fail
                    // when the '1' generates in the pos above Del (pos 9)
                    // So we just refresh page to generate a new keypad image and try again..
                    // await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
                    reject();
                }
            })
        }

        const pinPrompt = async () => {
            prompt.hide('Press enter when finished.');
            try {
                const outcome = await racePromises([
                    page.waitForSelector('#a_ocph_ucKeypad_imgKeypad', { timeout: 0 }),
                    page.waitForSelector('#Report23', { timeout: 0 }),
                ]);
    
                if (outcome === 0) {
                    console.log('\nTry your PIN again!');
                    pinPrompt();
                } else {
                    return;
                }
            } catch (error) {}
        }

        const loginPrompt = async () => {
            prompt.hide('Press enter when finished.');
            try {
                const outcome = await racePromises([
                    page.waitForSelector('#sso-cou', { timeout: 0 }),
                    page.waitForSelector('#a_ocph_ucKeypad_imgKeypad', { timeout: 0 }),
                ]);
    
                if (outcome === 0) {
                    console.log('\nTry your login again!');
                    loginPrompt();
                } else {
                    return;
                }
            } catch (error) {}
        }

        const attemptLogin = async () => {
            const outcome = await racePromises([
                page.waitForSelector('#sso-cou', { timeout: 0 }),
                page.waitForSelector('#a_ocph_ucKeypad_imgKeypad', { timeout: 0 })
            ]);
            if (outcome === 0) {    
                await page.type('#username', user);
                await page.type('#password', pw);
        
                await this.waitAndClick(page, '#sso-cou');
                await this.waitAndClick(page, '#sso-signin');

                const secondOutcome = await racePromises([
                    page.waitForSelector('#sso-cou', { timeout: 0 }),
                    page.waitForSelector('#a_ocph_ucKeypad_imgKeypad', { timeout: 0 })
                ]);

                return secondOutcome !== 0;
            } else {
                return true;
            }
        }

        let login;

        try {
            login = await attemptLogin();
        } catch (error) {}
        
        if (!login) {
            console.error('\nFailed entering MIS/Pass! Were these details correct?\nPlease enter manually.');
            loginPrompt();
        };
        
        await tryKeyPad().catch((e) => {
            console.error('\nFailed entering OneSchool PIN!\nPlease enter manually.');
            pinPrompt();
        });

        return;
    }

    async waitAndClick(page, selector) {
        await page.waitForSelector(selector);
        await page.click(selector);
        return;
    }

    close() {
        this.browser.close();
    }
}


module.exports = {
    Browser
}