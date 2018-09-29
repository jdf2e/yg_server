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
const parserapi = require('../api/nmparser');
const sync = require('../util/sync');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.build) {
    build(protocol, socket);
    return true;
  }
  return false;
};

function build(protocol, socket) {
  console.log('build');

  const ygconfig = protocol.args.ygconfig;
  const projPath = path.resolve(config.YG_BASE_PATH, ygconfig.puuid);

  // 将编译器软连过来
  let errorOccur = parserapi.linkParser(projPath);

  if (errorOccur) {
    console.log('链接编译器失败,断开链接');
    socket.emit('msg', '链接编译器失败,断开链接\n');
    socket.disconnect();
    return;
  }

  console.log('将服务端npm执行的变更同步到客户端');

  const watcher = sync.watchToSendRemote(socket, projPath);

  socket.on('disconnect', () => {
    watcher.close();
  });

  // 启动interact.runCMD npm xxx
  interact.runCMD(ygconfig.nv, ygconfig.puuid, socket, ygconfig.port, ['npm', 'run', 'build'], ygconfig.domain);
}
