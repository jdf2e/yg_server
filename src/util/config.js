const os = require('os');
const path = require('path');
const tmpdir = path.join(os.tmpdir(), "yg");
const shelljs = require('shelljs');
shelljs.mkdir("-p", tmpdir);

const config = {
    YG_PORT: 80,
    YG_BASE_PATH: "/export/yg_src",
    YG_TMP_PATH: tmpdir,
};
module.exports = config;