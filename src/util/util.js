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
let docker = new Docker();
module.exports = {
    docker: docker,
    currentUsedPort: 1,
    SOCKET_POOL: {},
    PORT_POOL: {},
    unZipTo(src, target) {
        return tar.x({
            file: src,
            C: target
        })
    },
    runCMD(puuid, socket, port = 8080, cmd) {
        let containerName = socket.containerName = "yg_c_id_" + puuid;
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
        docker.run('yg', cmd, new MyWritable, {
            name: containerName,
            WorkingDir: projPath,
            HostConfig: {
                Binds: [`${projPath}:${projPath}`]
            },
            Env: ["PATH=/root/.nvm/versions/node/v8.11.3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"],
        }).then(container => {
            return container.remove({
                force: true
            }).then(d => {
                console.log(`socket.disconnect(true);`);
                socket.disconnect(true);
            })
        }).catch(ex => {
            console.log(ex);
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