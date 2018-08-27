const path = require("path");
const Stream = require("stream");
const config = require("../util/config.js");
const Docker = require('dockerode');
const getPort = require('get-port');
const util = require('./util');

async function runCMD(nodeVersion = "8.11.3", puuid, socket, port = config.CONTAINER_PORT, cmd) {
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
  class MyReadable extends Stream.Readable {
    constructor(options) {
      super(options);
    }
    _read() {
      socket.on('stdin', (input) => {
        console.log('stdin', input+'\n');
        this.push(input);
      });
    }
  }

  let containerName = socket.containerName = "yg_c_puuid_" + puuid;
  let projPath = path.join(config.YG_BASE_PATH, puuid);
  let outerPort;
  if (util.PORT_POOL[puuid]) {
    outerPort = await getPort({
      port: ~~util.PORT_POOL[puuid]
    });
  } else {
    outerPort = await getPort();
  };
  util.PORT_POOL[puuid] = outerPort;

  socket.emit("receive", {
    outerPort: outerPort,
  });

  let evn = [`PATH=/root/.nvm/versions/node/v${nodeVersion}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`];

  /**
   * 注射器，多种构建平台猜测配置文件
   */
  if (util.webpackDevServerInjector(projPath, outerPort)) {
    port = outerPort;
    evn.push("HOST=0.0.0.0");
    evn.push("PORT=" + port);
  };
  console.log('port----', port, outerPort);

  const docker = new Docker();

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
      },
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
      if (err) throw err;

      // 代理stdin，stdout
      // process.stdin.pipe(stream);
      (new MyReadable()).pipe(stream);
      stream.pipe(new MyWritable());

      // 启动容器
      container.start()
      // .then(container => {
      //   return container.remove({
      //     force: true
      //   }).then(d => {
      //     console.log(`socket.disconnect(true);`);
      //     socket.disconnect(true);
      //   });
      // })
      .catch(ex => {
        util.removeContainerByName(containerName);
        socket.emit("err", ex);
        console.log("err:", ex);
      });
    });
  })
}

exports.runCMD = runCMD;
