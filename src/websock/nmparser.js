const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const config = require('../util/config');
const PM = require('./ProtocolModel');
const eventconsts = require('../eventconsts');

const parserapi = require('../api/nmparser');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.cli.list) {
    list(protocol, socket);
    return true;
  } else if (protocol.cmd === eventconsts.cli.check) {
    check(protocol, socket);
    return true;
  } else if (protocol.cmd === eventconsts.cli.freeze) {
    // freeze(protocol, socket);
    return true;
  } else if (protocol.cmd === eventconsts.cli.use) {
    // use(protocol, socket);
    return true;
  }
  return false;
}

/**
 * 获取编译器列表
 * @param {*} protocol
 * @param {*} socket
 */
function list(protocol, socket) {
  if (protocol.options.all) {
    // TODO 查看内置和自定义的模板
    console.log('查看所有编译器名');
  } else {
    // do below
  }

  let listArr = parserapi.list(protocol.options.all);

  socket.emit(eventconsts.cli.list, new PM(
    eventconsts.cli.list,
    protocol.options,
    {
      list: listArr,
      isErr: false
    }
  ));
}

function check(protocol, socket) {
  console.log('check');

  let isExsit = parserapi.check(protocol.options.parserName)

  socket.emit(eventconsts.cli.check, new PM(
    eventconsts.cli.check,
    protocol.options,
    {isErr: false, isExsit}
  ));
}
