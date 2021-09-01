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
                    slowMo,
                    defaultViewport: null,
                    executablePath: './chromium/win64-674921/chrome-win/chrome.exe'
                });
                // // set clipBoard API permissions
                // const context = this.browser.defaultBrowserContext();
                // context.clearPermissionOverrides()
                // context.overridePermissions(config.APPLICATION_URL, ['clipboard-write'])
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
            try {
                for (const eqid in eqids) {
                    await this.createNote(note, eqid, eqids[eqid]);
                }
            } catch (e) {
                console.error('Failed to create a note for ' + eqid);
            }
            resolve();
        })
    }

    async createNote(note, eqid, contactWithCount) {
        return new Promise(async (resolve, reject) => {
            console.log('Creating page..')
            const page = await this.browser.newPage();
            await this.initPage(page);
            await page.goto(`https://oslp.eq.edu.au/OSLP/student/MaintainContact.aspx?EQId=${eqid}`);

            const date = '#a_ocph_ucRecordOfContact_txtContactDt_txtDate';
            const typeSelector = '#a_ocph_ucRecordOfContact_cboContactType';
            const nameButton = '#a_ocph_ucRecordOfContact_txtContactWith_imgClear';
            const confirmNameButton = '#a_ocph_ucRecordOfContact_txtContactWith_lnkPopup';
            const initiatedSelector = '#a_ocph_ucRecordOfContact_cboDetails';
            const detailsSelector = '#a_ocph_ucRecordOfContact_txtNotes';

            const studentCheckbox = '#a_ocph_ucRecordOfContact_chkStudent';

            let parentCheckboxes = [];
            
            await this.waitAndClick(page, nameButton);
            const lName = '#a_ocph_ucRecordOfContact_txtContactWith_txtFamilyName';
            const fName = '#a_ocph_ucRecordOfContact_txtContactWith_txtGivenNames';

            
            await page.waitForSelector(lName);
            await page.waitForSelector(fName);
            
            for (let i = 0; i < contactWithCount - 1; i++) {
                parentCheckboxes.push(`#a_ocph_ucRecordOfContact_rptContactWithGuardians_ctl0${i}_chkGuardian`);
            };
            
            await this.waitAndClick(page, studentCheckbox);
            
            parentCheckboxes.forEach(async check => {
                await this.waitAndClick(page, check);
            });

            if (note.unaware) {
                await this.waitAndClick(page, '#a_ocph_ucRecordOfContact_chkParentUnaware');
            }
            
            // await page.click(date);
            // await page.keyboard.down('ControlLeft');
            // await page.keyboard.press('KeyA');
            // await page.keyboard.up('ControlLeft');
            // await page.type(date, note.date);
            await this.setInputValue(page, date, note.date);
            
            await page.select(typeSelector, 'E');
            
            
            await page.waitForSelector(confirmNameButton);
            
            
            // await page.type(lName, note.lName);
            // await page.type(fName, note.fName);
            await this.setInputValue(page, lName, note.lName);
            await this.setInputValue(page, fName, note.fName);
            
            await page.select(initiatedSelector, 'SC');
            
            //await page.type(detailsSelector, note.details);
            await this.setInputValue(page, detailsSelector, note.details);
            
            await this.waitAndClick(page, confirmNameButton);
            
            resolve();
        })
    }

    async auth(user, pw , PIN) {
        const pages = await this.browser.pages();
        const page = pages[0];
        await page.goto('https://oslp.eq.edu.au', { waitUntil: 'networkidle0' });

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
            return new Promise(async (resolve, reject) => {
                const outcome = await racePromises([
                    page.waitForSelector('#sso-cou', { timeout: 0 }),
                    page.waitForSelector('#a_ocph_ucKeypad_imgKeypad', { timeout: 0 })
                ]).catch(r => {});
                if (outcome === 0) {   
                    await page.type('#username', user);
                    await page.type('#password', pw);
            
                    await this.waitAndClick(page, '#sso-cou');
                    await this.waitAndClick(page, '#sso-signin');
    
                    const secondOutcome = await racePromises([
                        page.waitForSelector('#sso-cou', { timeout: 0 }),
                        page.waitForSelector('#a_ocph_ucKeypad_imgKeypad', { timeout: 0 })
                    ]).catch(r => {});

                    resolve(secondOutcome !== 0);
                } else {
                    resolve(true);
                }
            })
        }

        const login = await attemptLogin().catch(r => {});
        
        if (!login) {
            console.error('\nFailed entering MIS/Pass! Were these details correct?\nPlease enter manually.');
            loginPrompt();
        };
        
        await tryKeyPad().catch((e) => {
            console.error('\nFailed entering OneSchool PIN!\nPlease enter manually.');
            pinPrompt();
        });

        return page;
    }

    async waitAndClick(page, selector) {
        await page.waitForSelector(selector);
        await page.click(selector);
        return;
    }

    async setInputValue(page, selector, value) {
        page.evaluate((data) => {
            return document.querySelector(data.selector).value = data.value;
        }, {selector, value})
    }

    disconnect() {
        this.browser.disconnect();
    }
}


module.exports = {
    Browser
}