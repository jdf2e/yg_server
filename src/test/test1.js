const Stream = require('stream');
var stdout = require('stdout-stream');
const tar = require("tar");

tar.c({
    gzip: true,
    file: 'my-tarball.tgz',
    cwd:"/export/yg_src"
}, ['.']).then(_ => {})