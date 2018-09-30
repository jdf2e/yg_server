const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const shelljs = require('shelljs');
const config = require('../util/config');
const PM = require('./ProtocolModel');
const eventconsts = require('../eventconsts');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.clean) {
    clean(protocol, socket);
    return true;
  }
  return false;
}

/**
 * 清除数据
 * @param {*} protocol
 * @param {*} socket
 */
function clean(protocol, socket) {
  let isOK = true;
  try {
    const puuid = protocol.args.puuid;
    const projPath = path.resolve(config.YG_BASE_PATH, puuid);
    shelljs.rm('-rf', path.resolve(projPath, '*'));
  } catch (error) {
    // nothing
  }
  socket.emit(eventconsts.clean, new PM(eventconsts.clean, protocol.options, {
    isOK,
    isErr: false
  }));
}
