const re = /[0-9]{10}[A-Z]/g;

function complete(commands) {
    return function (str) {
        let i;
        let ret = [];
        for (i = 0; i < commands.length; i++) {
            if (commands[i].indexOf(str) == 0)
                ret.push(commands[i]);
        }
        return ret;
    };
}

module.exports = { re, complete }