const shelljs = require("shelljs");
const path = require("path");
const kill = require('tree-kill');
const config = require('../util/config');
const util = require('../util/util');
const {runCMD} = require('../util/interact');
const template = require('./template');
const nmparser = require('./nmparser');
const init = require('./init');
const ssfile = require('./ssfile');
const start = require('./start');
const npm = require('./npm');
const build = require('./build');

const websock = {
    init(socket) {
        socket.on("disconnect", function (data) {
            console.log("disconnect");
            console.log(socket.containerName);
            if (socket.containerName) {
                util.removeContainerByName(socket.containerName);
            }
        });

        socket.on("runshell", function (data) {
            let projectPath = path.join(config.YG_BASE_PATH, data.config.puuid);
            shelljs.mkdir("-p", projectPath);
            let oldrecord = util.SOCKET_POOL[data.config.puuid];
            if (oldrecord) {
                if (oldrecord.socket) {
                    oldrecord.socket.disconnect(true);
                    util.removeContainerByName("yg_c_puuid_" + data.config.puuid);
                }
            }
            let record = util.SOCKET_POOL[data.config.puuid] = {
                socket: socket,
                pInfo: data
            };
            data.config.port = ~~data.config.port || config.CONTAINER_PORT;

            // todo 这是个异步方法
            runCMD(data.config.nv, data.config.puuid, socket, data.config.port, data.cmdArr);
            // util.runCMD(data.config.nv, data.config.puuid, socket, data.config.port, data.cmdArr);
        });

        socket.on('clientEvent', (protocol, fn) => {
            if (fn) {
                fn(0);
            }
            console.log(protocol.options);
            // TODO 各条命令都由此入口
            if (!(
                template.handler(protocol, socket) ||
                nmparser.handler(protocol, socket) ||
                init.handler(protocol, socket) ||
                ssfile.handler(protocol, socket) ||
                start.handler(protocol, socket) ||
                npm.handler(protocol, socket) ||
                build.handler(protocol, socket)
            )) {
                console.log('没有被任何命令处理，报错，断开连接');
                socket.disconnect();
            }
        });
    }
};

module.exports = websock;
