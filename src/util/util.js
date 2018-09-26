const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const Stream = require("stream");
const URL = require('url');
const shelljs = require('shelljs');
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

    async tarFolder(puuid, downloadFolder) {
        //console.log("打包中");
        let folders = [puuid];
        let cwd = path.join(config.YG_BASE_PATH, puuid);

        if (downloadFolder !== "." && downloadFolder !== "all") {
            downloadFolder = _.trim(downloadFolder, '/');
            cwd = path.join(cwd, downloadFolder);
            cwd = path.dirname(cwd);

            let targetFolder = downloadFolder.split('/').pop();
            folders = [targetFolder];
        } else {
            folders = [...shelljs.ls(cwd)];
        }


        let tarFileName = puuid + ".tgz";
        let targetTarFilePath = path.join(__dirname, "../../static", tarFileName);
        shelljs.mkdir("-p", path.dirname(targetTarFilePath));
        if (fs.existsSync(targetTarFilePath)) {
            shelljs.rm(targetTarFilePath);
        }
        return tar.c({
            gzip: true,
            file: targetTarFilePath,
            cwd: cwd,
            filter: function (p, stat) {
                return p !== "node_modules" && !/.tgz$/ig.test(p)
            }
        }, folders).then(d => {
            return targetTarFilePath;
        })
    },

    async runCMD(nodeVersion = "8.11.3", puuid, socket, port = config.CONTAINER_PORT, cmd) {
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
        }
        class MyReadable extends Stream.Readable {
            constructor(options) {
                super(options);
            }
            _read() {
                socket.on('stdin', (input) => {
                    console.log('stdin', input);
                    this.push(input);
                    this.push(null);
                });
            }
        }

        let projPath = path.join(config.YG_BASE_PATH, puuid);
        console.log(projPath);
        let outerPort;
        if (util.PORT_POOL[puuid]) {
            outerPort = await getPort({
                port: ~~util.PORT_POOL[puuid]
            });
        } else {
            outerPort = await getPort();
        }
        util.PORT_POOL[puuid] = outerPort;
        socket.emit("receive", {
            outerPort: outerPort
        });


        let evn = [`PATH=/root/.nvm/versions/node/v${nodeVersion}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`];

        /**
         * 注射器，多种构建平台猜测配置文件
         */
        if (util.webpackDevServerInjector(projPath, outerPort)) {
            port = outerPort;
            evn.push("HOST=0.0.0.0");
            evn.push("PORT=" + port);
        }
        console.log('port----', port, outerPort);
        console.log(cmd)
        docker.run('yg', cmd, new MyWritable(), {
            name: containerName,
            AttachStdin: true,
            OpenStdin: true,
            // AttachStdout: true,
            // AttachStderr: true,
            WorkingDir: projPath,
            ExposedPorts: {
                [`${port}/tcp`]: {}
            },
            HostConfig: {
                //Privileged: true,
                // NetworkMode: "host",
                Binds: [`${projPath}:${projPath}`],
                PortBindings: {
                    [`${port}/tcp`]: [{
                        "HostPort": `${outerPort}`
                    }]
                }
            },
            Env: evn
        })
        .then(container => {
            console.log(container)
            return container;
        })
        .then(container => {
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
    },
    webpackDevServerInjector(currentFolder, port) {
        let flag = false;
        let packageJSONFile = path.join(currentFolder, "package.json");
        if (fs.existsSync(packageJSONFile)) {
            let packageTxt = fs.readFileSync(packageJSONFile, "utf-8");
            let packageObj = JSON.parse(packageTxt);
            if (packageObj.scripts) {
                Object.keys(packageObj.scripts).map(key => {
                    let val = packageObj.scripts[key] + "";
                    if (val.includes("webpack-dev-server")) {
                        flag = true;
                        if (!val.includes("--disable-host-check")) {
                            val += " --disable-host-check "
                        }

                        if (val.includes("--host")) {
                            val = val.replace(/--host\s*\S*/ig, " --host 0.0.0.0 ");
                        } else {
                            val += " --host 0.0.0.0 "
                        }

                        if (val.includes("--port")) {
                            val = val.replace(/--port\s*\S*/ig, ` --port ${~~port}`);
                        } else {
                            val += ` --port ${~~port}`
                        }
                    }
                    packageObj.scripts[key] = val
                });
                fs.writeFileSync(packageJSONFile, JSON.stringify(packageObj, null, 2));
            }
        }
        return flag;
    },

    /**
     *
     * @param {*} puuid 项目实例名
     * @param {*} ygName 固化模板名
     */
    async saveTemplate(puuid, ygName) {
        const repo = config.YG_SOLID_PATH;
        const projPath = path.join(config.YG_BASE_PATH, puuid);
        const saveshell = path.resolve(__dirname, '../shell/save-tpl.sh');
        let result = await shelljs.exec(`${saveshell} ${repo} ${ygName} ${projPath}`);
        if (result.code === 1) {
            return 1;
        }
        return 0;
    }
}

module.exports = util;
