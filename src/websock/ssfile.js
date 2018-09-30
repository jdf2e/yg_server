const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const shelljs = require('shelljs');
const config = require('../util/config');
const PM = require('./ProtocolModel');
const eventconsts = require('../eventconsts');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.uploadproj) {
    receive(protocol, socket);
    return true;
  }
  return false;
};

function receive(protocol, socket) {
  const ygconfig = protocol.args.ygconfig;
  const projPath = path.resolve(config.YG_BASE_PATH, ygconfig.puuid);

  try {
    // todo 为优化性能，应该保留node_modules, 音视频文件
    // shelljs.rm('-rf', projPath);
    const list = fs.readdirSync(projPath);
    console.log(list);
  } catch (error) {
    // nothing
  }

  shelljs.mkdir('-p', projPath);

  const myextract = tarfs.extract(projPath);

  ss(socket).on(eventconsts.uploadproj, (stream) => {
    stream.pipe(myextract);
  });
}
