const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const shelljs = require('shelljs');
const config = require('../util/config');
const PM = require('./ProtocolModel');
const eventconsts = require('../eventconsts');
const interact = require('../util/interact');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.start) {
    start(protocol, socket);
    return true;
  }
  return false;
};

function start(protocol, socket) {
  console.log('start');

  const ygconfig = protocol.args.ygconfig;
  const projPath = path.resolve(config.YG_BASE_PATH, ygconfig.puuid);

  let errorOccur = false;
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
      console.log('链接编译器失败,断开链接,');
      socket.emit('msg', '链接编译器失败,断开链接，可能原因是package.json格式错误\n');
      errorOccur = true;
  }

  console.log('run cmd');
  // 监听删除操作
  socket.on(eventconsts.uploadwatch, ({evt, file}) => {
    try {
      const filepath = path.resolve(projPath, file);
      if (evt === 'remove') {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      // nothing to do
    }
  });
  // 监听更新操作
  ss(socket).on(eventconsts.uploadwatch, (stream, data) => {
    const filepath = path.resolve(projPath, data.file);
    const targetDir = path.dirname(filepath);
    stream.pipe(tarfs.extract(targetDir));
  });

  if (errorOccur) {
    socket.disconnect();
    return;
  }

  // 启动interact.runCMD
  interact.runCMD(ygconfig.nv, ygconfig.puuid, socket, ygconfig.port, ['npm', 'run', 'dev'], ygconfig.domain);
}
