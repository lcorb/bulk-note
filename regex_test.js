const re = /[0-9]{10}[A-Z]/g;
const fs = require('fs');

function test() {
    let eqids = fs.readFileSync('./data/eqids/example_eqids.txt');
    const eqidsToParse = [...eqids.toString().matchAll(re)];

    let unique_eqids = {}
        
    eqidsToParse.forEach(v => {
        unique_eqids[v[0]] ? unique_eqids[v[0]] +=1 : unique_eqids[v[0]] = 1;
    });

    console.log(unique_eqids);

    for (const eqid in unique_eqids) {
        console.log(eqid);
    }
}

test();