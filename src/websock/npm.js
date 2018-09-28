const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const shelljs = require('shelljs');
const watch = require('node-watch');
const config = require('../util/config');
const ignore = require('../util/ignore');
const PM = require('./ProtocolModel');
const eventconsts = require('../eventconsts');
const interact = require('../util/interact');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.npm) {
    npm(protocol, socket);
    return true;
  }
  return false;
};

function npm(protocol, socket) {
  console.log('npm');

  const ygconfig = protocol.args.ygconfig;
  const projPath = path.resolve(config.YG_BASE_PATH, ygconfig.puuid);

  // 将编译器软连过来
  try {
    let pkg = JSON.parse(fs.readFileSync(path.resolve(projPath, 'package.json')).toString());
    let ygName = pkg.yg.parser;
    if (ygName) {
        console.log('链接模板node_modules');
        const injectstart = path.resolve(__dirname, '../shell/inject-start.sh');
        shelljs.exec(`${injectstart} ${config.YG_SOLID_PATH} ${ygName} ${projPath}`);
    }
  } catch (e) {
    console.log('链接编译器失败,断开链接');
    socket.emit('msg', '链接编译器失败,断开链接');
    socket.disconnect();
    return;
  }

  console.log('将服务端npm执行的变更同步到客户端');

  const watcher = watch(projPath, {
    recursive: true,
    filter: (name) => {
      return !ignore.isIgnored(path.relative(projPath, name));
    }
  }, (evt, name) => {
    // 存在批量更新时不能及时响应以及性能问题，最好是做一个缓冲区
    console.log(evt, name);
    const relativefilepath = path.relative(projPath, name);
    if (evt === 'remove') {
      socket.emit(eventconsts.uploadwatch, {
        evt,
        file: relativefilepath
      });
    } else {
      const watchstream = ss.createStream();
      const watchpack = tarfs.pack(projPath, {
        entries: [relativefilepath]
      });
      ss(socket).emit(eventconsts.uploadwatch, watchstream, {
        evt,
        file: relativefilepath
      });
      watchpack.pipe(watchstream);
    }
  });

  socket.on('disconnect', () => {
    watcher.close();
  });

  // 启动interact.runCMD npm xxx
  interact.runCMD(ygconfig.nv, ygconfig.puuid, socket, ygconfig.port, protocol.options._, ygconfig.domain);
}
