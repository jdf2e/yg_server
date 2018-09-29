const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const shelljs = require('shelljs');
const config = require('../util/config');
const PM = require('./ProtocolModel');
const eventconsts = require('../eventconsts');
const interact = require('../util/interact');
const parserapi = require('../api/nmparser');
const sync = require('../util/sync');

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

  // 开启监听前先保证软连成功
  let errorOccur = parserapi.linkParser(projPath);

  // 监听远端数据变化并同步到本地
  sync.listenToReceiveRemote(socket, projPath);

  if (errorOccur) {
    socket.emit('msg', '链接编译器失败,断开链接，可能原因是package.json格式错误\n');
    socket.disconnect();
    return;
  }

  // 启动interact.runCMD
  interact.runCMD(ygconfig.nv, ygconfig.puuid, socket, ygconfig.port, ['npm', 'run', 'dev', '--unsafe-perm'], ygconfig.domain);
}
