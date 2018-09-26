const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const config = require('../util/config');
const PM = require('./ProtocolModel');
const eventconsts = require('../eventconsts');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.init) {
    init(protocol, socket);
    return true;
  }
  return false;
}

/**
 * 初始化工程
 * @param {*} protocol
 * @param {*} socket
 */
function init(protocol, socket) {
  let isErr = false;
  socket.emit(eventconsts.init, new PM(
    eventconsts.init,
    protocol.options,
    {
      isErr
    }
  ));
}
