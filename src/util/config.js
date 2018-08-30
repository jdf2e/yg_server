const os = require('os');
const path = require('path');
const tmpdir = path.join(os.tmpdir(), "yg");
const shelljs = require('shelljs');
shelljs.mkdir("-p", tmpdir);

const config = {
    YG_PORT: 8081,  // yg server服务的启动端口
    YG_BASE_PATH: "/export/yg_src",
    YG_SOLID_PATH: '/export',  // 固化模板的父目录
    YG_TMP_PATH: tmpdir,
    CONTAINER_PORT: 8080   // yg云实例docker的内部server端口
};
module.exports = config;
