const fs = require('fs');
const path = require('path');
const config = require('../util/config');
const PM = require('./ProtocolModel');
const eventconsts = require('../eventconsts');

module.exports.handler = function (protocol, socket) {
  if (protocol.cmd === eventconsts.template.list) {
    list(protocol, socket);
    return true;
  } else if (protocol.cmd === eventconsts.template.clone) {
    clone(protocol, socket);
    return true;
  }
  return false;
}

/**
 * 获取模板列表
 * @param {*} protocol
 * @param {*} socket
 */
function list(protocol, socket) {
  if (protocol.options.all) {
    // TODO 查看内置和自定义的模板
  } else {
    // do below
  }
  let isErr = false;
  let tpls = [];
  try {
    const templateDir = config.YG_TEMPLATE_PATH;
    tpls = fs.readdirSync(templateDir);
  } catch (error) {
    isErr = true;
    console.log(error);
  }

  socket.emit(eventconsts.template.list, new PM(
    eventconsts.template.list,
    protocol.options,
    {
      list: tpls,
      isErr
    }
  ));
}

function clone(protocol, socket) {
  console.log('list');
}
