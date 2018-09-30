
const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const watch = require('node-watch');
const ignore = require('./ignore');
const eventconsts = require('../eventconsts');

let serverVersion = '';

module.exports.watchToSendRemote = function (socket, projPath) {
  return watch(projPath, {
    recursive: true,
    filter: (name) => {
      return !ignore.isIgnored(path.relative(projPath, name));
    }
  }, (evt, name) => {
    // 存在批量更新时不能及时响应以及性能问题，最好是做一个缓冲区
    const relativefilepath = path.relative(projPath, name);
    console.log(evt, relativefilepath);
    if (evt === 'remove') {
      socket.emit(eventconsts.uploadwatch, {
        evt,
        file: relativefilepath
      });
    } else {
      const watchstream = ss.createStream();
      const watchpack = tarfs.pack(projPath, {
        entries: [relativefilepath]
      });
      ss(socket).emit(eventconsts.uploadwatch, watchstream, {
        evt,
        file: relativefilepath
      });
      watchpack.pipe(watchstream);
    }
  });
};

module.exports.listenToReceiveRemote = function (socket, projPath) {
  // 监听删除操作
  socket.on(eventconsts.uploadwatch, ({evt, file}) => {
    try {
      const filepath = path.resolve(projPath, file);
      if (evt === 'remove') {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      // nothing to do
    }
  });
  // 监听更新操作
  ss(socket).on(eventconsts.uploadwatch, (stream, data) => {
    stream.pipe(tarfs.extract(projPath));
  });
};

module.exports.versionCheck = function (socket) {
  if (!serverVersion) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json')).toString());
      serverVersion = pkg.version;
    } catch (error) {
      // nothing
    }
  }

  socket.emit(eventconsts.yg_version_sync, serverVersion);
};
