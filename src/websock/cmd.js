const path = require('path');
const config = require('../util/config');
const eventconsts = require('../eventconsts');
const interact = require('../util/interact');
const parserapi = require('../api/nmparser');
const sync = require('../util/sync');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.cmd) {
    cmd(protocol, socket);
    return true;
  }
  return false;
};

function cmd(protocol, socket) {
  console.log('cmd');

  const ygconfig = protocol.args.ygconfig;
  const projPath = path.resolve(config.YG_BASE_PATH, ygconfig.puuid);

  // 将编译器软连过来
  let errorOccur = parserapi.linkParser(projPath);

  if (errorOccur) {
    console.log('链接编译器失败,断开链接');
    socket.emit('msg', '链接编译器失败,断开链接');
    socket.disconnect();
    return;
  }

  console.log('将服务端cmd执行的变更同步到客户端');

  const watcher = sync.watchToSendRemote(socket, projPath);

  socket.on('disconnect', () => {
    watcher.close();
  });

  // 启动interact.runCMD  xxx
  let options = protocol.options
  let args = []
  for ( let k in options) {
    if ( !/(^\$|\bdirname\b|\b_\b)/.test(k)){
      args.push(`--${k} ${options[k]}`)
    }
  }
  args = options._.concat(args)
  interact.runCMD(ygconfig.nv, ygconfig.puuid, socket, ygconfig.port, args , ygconfig.domain);
}
