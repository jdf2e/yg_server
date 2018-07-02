const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const Stream = require("stream");
const URL = require('url');
const shell = require('shelljs');
const cp = require('child_process');
const config = require("../util/config.js");
const tar = require("tar");
const Docker = require('dockerode');
const getPort = require('get-port');


let docker = new Docker();
const util = {
    docker: docker,
    SOCKET_POOL: {},
    PORT_POOL: {},
    unZipTo(src, target) {
        return tar.x({
            file: src,
            C: target
        })
    },
    async runCMD(nodeVersion = "8.11.3", puuid, socket, port = 8080, cmd) {
        let containerName = socket.containerName = "yg_c_puuid_" + puuid;
        class MyWritable extends Stream.Writable {
            constructor(options) {
                super(options);
            }
            _write(chunk, encoding, callback) {
                let stringData = chunk.toString();
                socket.emit("msg", stringData);
                console.log(stringData)
                callback();
            }
        };

        let projPath = path.join(config.YG_BASE_PATH, puuid);
        console.log(projPath);

        let outerPort;
        if (util.PORT_POOL[puuid]) {
            outerPort = await getPort({
                port: ~~util.PORT_POOL[puuid]
            });
        } else {
            outerPort = await getPort();
        };

        util.PORT_POOL[puuid] = outerPort;
        console.log("outerPort", outerPort);
        console.log("port", port);
        docker.run('yg', cmd, new MyWritable, {
            name: containerName,
            WorkingDir: projPath,
            ExposedPorts: {
                [`${port}/tcp`]: {}
            },
            HostConfig: {
                // NetworkMode: "default",
                Binds: [`${projPath}:${projPath}`],
                PortBindings: {
                    [`${port}/tcp`]: [{
                        "HostPort": `${outerPort}`
                    }]
                },
            },
            Env: [`PATH=/root/.nvm/versions/node/v${nodeVersion}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`],
        }).then(container => {
            return container.remove({
                force: true
            }).then(d => {
                console.log(`socket.disconnect(true);`);
                socket.disconnect(true);
            });
        }).catch(ex => {
            util.removeContainerByName(containerName);
            socket.emit("err", ex);
            console.log("err:", ex);
        });
    },
    removeContainerByNameUseCp(containerName) {
        cp.execSync(`docker rm  ${containerName} --force`);
    },
    removeContainerByName(containerName) {
        docker.listContainers({
            all: true
        }).then(list => {
            list.map(containerInfo => {
                containerInfo.Names.map(name => {
                    if (name.includes(containerName)) {
                        let container = docker.getContainer(containerInfo.Id);
                        container.remove({
                            force: true
                        }, function (err, data) {})
                    }
                });
            });
        });
    }
}

module.exports = util;