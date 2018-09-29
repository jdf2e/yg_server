const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const shelljs = require('shelljs');
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
    freeze(protocol, socket);
    return true;
  } else if (protocol.cmd === eventconsts.cli.use) {
    // use(protocol, socket);
    // 参见init.init()
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

  let isExsit = parserapi.check(protocol.options.parserName);

  socket.emit(eventconsts.cli.check, new PM(
    eventconsts.cli.check,
    protocol.options,
    {isErr: false, isExsit}
  ));
}

function freeze(protocol, socket) {
  const puuid = protocol.args.ygconfig.puuid;
  const ygName = protocol.options.parserName;
  const repo = config.YG_SOLID_PATH;
  const projPath = path.join(config.YG_BASE_PATH, puuid);
  const saveshell = path.resolve(__dirname, '../shell/save-tpl.sh');
  let result = shelljs.exec(`${saveshell} ${repo} ${ygName} ${projPath}`);

  if (result.code === 1) {
    socket.emit('msg', '固化过程出错\n');
  }

  socket.emit('msg', '固化成功\n');

  socket.disconnect();
}
