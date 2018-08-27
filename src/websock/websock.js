const shelljs = require("shelljs");
const path = require("path");
const kill = require('tree-kill');
const config = require('../util/config');
const util = require('../util/util');
const {runCMD} = require('../util/interact');

const websock = {
    init(socket) {
        // socket.on("regist", function (data) {
        //     let record = util.SOCKET_POOL[data.id];
        //     if (record) {
        //         if (record.socket) {
        //             record.socket.disconnect(true);
        //         }
        //         if (record.cProcess) {
        //             kill(record.cProcess.pid);
        //         }
        //     }
        //     util.SOCKET_POOL[data.id] = {
        //         socket: socket,
        //         pInfo: data
        //     }
        // });

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
            };
            let record = util.SOCKET_POOL[data.config.puuid] = {
                socket: socket,
                pInfo: data
            };
            data.config.port = ~~data.config.port || config.CONTAINER_PORT;

            // todo 这是个异步方法
            runCMD(data.config.nv, data.config.puuid, socket, data.config.port, data.cmdArr);
            // util.runCMD(data.config.nv, data.config.puuid, socket, data.config.port, data.cmdArr);
        });
    },
};
module.exports = websock;
