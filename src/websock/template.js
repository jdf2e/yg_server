const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
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
    console.log('查看所有模板名')
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
  console.log('clone ');
  let isErr = false;
  const tplName = protocol.options.name;
  try {
    const templateDir = config.YG_TEMPLATE_PATH;
    let tpls = fs.readdirSync(templateDir) || [];
    let index = tpls.findIndex((tpl) => {
      return tpl === tplName;
    });
    console.log(index)
    if (index < 0) {
      isErr = true;
    }
  } catch (error) {
    isErr = true;
    console.log(error);
  }

  if (isErr) {
    socket.emit(eventconsts.template.clone, new PM(
      eventconsts.template.clone,
      protocol.options,
      {isErr}
    ));
    return;
  }

  try {
    const tplDir = path.resolve(config.YG_TEMPLATE_PATH, tplName);
    var mypack = tarfs.pack(tplDir);

    let netsteam = ss.createStream();
    netsteam.on('end', () => {
      socket.emit(eventconsts.template.clone, new PM(
        eventconsts.template.clone,
        protocol.options,
        {isErr: false}
      ));
    });
    netsteam.on('error', () => {
      socket.emit(eventconsts.template.clone, new PM(
        eventconsts.template.clone,
        protocol.options,
        {isErr: true}
      ));
    });

    ss(socket).emit(eventconsts.template.clone, netsteam, {name: tplName});

    mypack.pipe(netsteam);
  } catch (error) {
    socket.emit(eventconsts.template.clone, new PM(
      eventconsts.template.clone,
      protocol.options,
      {isErr: true}
    ));
  }
}
