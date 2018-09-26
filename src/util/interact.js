const path = require("path");
const Stream = require("stream");
const config = require("../util/config.js");
const Docker = require('dockerode');
const getPort = require('get-port');
const util = require('./util');
const fs = require('fs');

async function runCMD(nodeVersion = "8.11.3", puuid, socket, port = config.CONTAINER_PORT, cmd) {
  class MyWritable extends Stream.Writable {
    constructor(options) {
      super(options);
    }
    _write(chunk, encoding, callback) {
      socket.emit("msg", chunk);
      callback();
    }
  }
  class MyReadable extends Stream.Readable {
    constructor(options) {
      super(options);
    }
    _read() {
      socket.on('stdin', (input) => {
        this.push(input);
        this.push('');
      });
    }
  }

  const mystdin = new MyReadable();
  const mystdout = new MyWritable();

  let containerName = socket.containerName = "yg_c_puuid_" + puuid;
  let projPath = path.join(config.YG_BASE_PATH, puuid);
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

  let evn = [`PATH=/root/.nvm/versions/node/v${nodeVersion}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${projPath}/node_modules/.bin`];

  /**
   * 注射器，多种构建平台猜测配置文件
   */
  if (util.webpackDevServerInjector(projPath, outerPort)) {
    port = outerPort;
    evn.push("HOST=0.0.0.0");
    evn.push("PORT=" + port);
  }
  console.log('port----', port, outerPort);

  const docker = new Docker();

  const Binds = [`${projPath}:${projPath}`];
  try {
    let pkg = JSON.parse(fs.readFileSync(path.join(projPath, 'package.json')).toString());
    let solidName = pkg.yg || '';
    if (solidName) {
      const solidPath = path.resolve(config.YG_SOLID_PATH, solidName);
      Binds.push(`${solidPath}:${solidPath}`);
    }
  } catch (e) {
    // nothing
  }


  docker.createContainer({
      Image: 'yg',
      name: containerName,
      Cmd: ['/bin/bash', '-c', cmd.join(' ')],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      OpenStdin: true,
      WorkingDir: projPath,
      Volumes: {},
      ExposedPorts: {
        [`${port}/tcp`]: {}
      },
      HostConfig: {
        //Privileged: true,
        // NetworkMode: "isolated_nw",
        Binds,
        PortBindings: {
          [`${port}/tcp`]: [{
            "HostPort": `${outerPort}`
          }]
        }
      },
      Env: evn
    })
    .then(container => {
      return container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true
      }, (err, stream) => {
        if (err) {
          throw err;
        }

        // 代理stdin，stdout
        mystdin.pipe(stream);
        stream.pipe(mystdout);
        mystdout.on('finish', () => {
          console.log('控制台输出完毕, 删除容器');
          container.inspect()
            .then(res => {
              let promise = Promise.resolve();
              if (res.State.Running || res.State.Paused || res.State.Restarting) {
                promise = container.stop().then(() => {
                  return container.remove({
                    force: true
                  })
                });
              }
              promise
              .then(() => {
                console.log(`socket.disconnect(true);`);
                socket.emit('selfclose');
                socket.disconnect(true);
              })
              .catch(ex => {
                util.removeContainerByName(containerName);
                socket.emit("err", ex);
                console.log("err:", ex);
              });
            });
        });

        // 启动容器
        container.start()
          .catch(ex => {
            util.removeContainerByName(containerName);
            socket.emit("err", ex);
            console.log("err:", ex);
          });
      });
    })
    .catch(err => {
      console.log(`socket.disconnect(true);`);
      socket.emit("msg", '容器启动失败，请重试\n');
      socket.emit('selfclose');
      socket.disconnect(true);
      util.removeContainerByName(containerName);
    });
}

exports.runCMD = runCMD;
