const fs = require('fs');
const util = require('../util/util');

global.myArgs = process.argv.slice(2);


let json = util.tryReadAsJSON(global.myArgs[0]);
json = json.sort((a, b) => {
    return a.href.localeCompare(b.href);
})

json = json.map(d => {
    return d.href;
});
fs.writeFileSync("dump.json", JSON.stringify(json, null, 2));
